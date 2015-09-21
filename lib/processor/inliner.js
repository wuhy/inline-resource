/**
 * @file 内联处理器基础类
 * @author sparklewhy@gmail.com
 */

var fs = require('fs');
var pathUtil = require('path');
var urlUtil = require('url');
var _ = require('lodash');
var util = require('../util');
var helper = require('./helper');
var debug = require('debug')('inliner');

/**
 * 读取文件信息
 *
 * @param {string} relativePath 相对 `base` 的文件路径
 * @param {string} base 相对的根目录
 * @return {?Object}
 */
function readFileInfo(relativePath, base) {
    try {
        return {
            data: fs.readFileSync(relativePath),
            extname: util.getFileExtName(relativePath),
            path: util.normalizePath(relativePath),
            fullPath: util.normalizePath(pathUtil.resolve(base, relativePath))
        };
    }
    catch (e) {
        console.error('read file %s fail', relativePath);
    }

}

/**
 * 读取要处理的内联文件
 *
 * @param {string} root 读取的根目录
 * @param {Array.<string|Object>} files 要读取的文件 pattern
 * @param {Array.<Object>} allFiles 要处理的文件全集
 * @return {Array.<Object>}
 */
function readInlineFiles(root, files, allFiles) {
    var result = [];

    if (!files || !files.length) {
        return result;
    }

    if (_.isPlainObject(files[0])) {
        return files;
    }

    if (Array.isArray(allFiles)) {
        allFiles.forEach(function (f) {
            if (util.isMatch(f.path, files)) {
                result.push(f);
            }
        });
    }
    else {
        util.traverseFileSync(root, function (path) {
            var relativePath = pathUtil.relative(root, path);
            if (util.isMatch(relativePath, files)) {
                debug('match: %s ', relativePath);
                var fileInfo = readFileInfo(relativePath, root);
                fileInfo && result.push(fileInfo);
            }
        });
    }

    return result;
}

/**
 * 获取处理器类型
 *
 * @param {Object} file 要处理的文件
 * @param {Object} options 内联选项
 * @return {?string}
 */
function getProcessorType(file, options) {
    // 对于包含 owner 属性，说明没有一个真实的文件映射，比如 html 里的 script 里的脚本内容
    if (file.owner) {
        return file.type;
    }

    var processor = options.processor;
    if (_.isFunction(processor)) {
        return processor(file);
    }

    return util.getFileType(file.path);
}

/**
 * 获取内联处理器
 *
 * @param {Object} file 要处理的文件
 * @param {Object} options 内联选项
 * @return {Inliner}
 */
function getInlineProcessor(file, options) {
    var processorType = getProcessorType(file, options);
    var Processor = processorType && Inliner[processorType];
    if (Processor) {
        return new Processor(file, _.merge({}, options));
    }
}

/**
 * 内联文件
 *
 * @inner
 * @param {string} filePath 内联的文件路径
 * @param {Object} options 内联的选项
 * @return {?Object}
 */
function inline(filePath, options) {
    var file;
    if (_.isString(filePath)) {
        var allFiles = options.allFiles;
        if (allFiles) {
            file = util.findItem('path', filePath, allFiles);
        }
        else {
            file = readFileInfo(filePath, options.root);
        }
    }
    else {
        file = filePath;
    }

    if (!file) {
        return;
    }

    var processor = getInlineProcessor(file, options);
    if (processor) {
        processor.inline();
    }

    return file;
}

/**
 * 创建内联处理器
 *
 * @param {Object} file 内联的文件
 * @param {Object} option 内联选项
 * @constructor
 */
function Inliner(file, option) {
    this.file = file;
    this.option = option || {};
    this.taskList = [];
    this.debug = debug;

    // 初始化压缩选项
    var typeOpt = option[this.type];
    if (typeOpt && !_.isObject(typeOpt)) {
        typeOpt = {};
    }
    this.enableCompress = !!(typeOpt && typeOpt.compress);
    this.compressOption = typeOpt && typeOpt.compress;
    _.isPlainObject(this.compressOption) || (this.compressOption = {});
}

/**
 * 初始化内联任务
 *
 * @param {Array.<Object>} tasks 要初始化的内联任务项
 */
Inliner.prototype.initInlineTasks = function (tasks) {
    var taskList = this.taskList;

    tasks.forEach(function (item) {
        item.enable && taskList.push(item.task);
    });
    this.debug('init inline task number: %s', taskList.length);
};

/**
 * 添加内联任务
 *
 * @param {function(Object):string} task 添加的内联任务
 */
Inliner.prototype.addInlineTask = function (task) {
    this.taskList.push(task);
};

/**
 * 重新计算给定的样式文件里引用的文件的路径信息
 *
 * @param {Object} file 要 rebase 的文件
 * @param {Object} targetFile 重新调整的目标文件
 * @return {string}
 */
Inliner.prototype.rebaseCSS = function (file, targetFile) {
    var me = this;
    var data = file.data;

    var cssOption = me.option.css;
    if (cssOption && cssOption.rebase) {
        return data.replace(helper.CSS_URL_REGEXP, function (match, url) {
            if (util.isLocalPath(url)) {
                me.debug('rebaes css url: %s from %s to %s', url, file.path, targetFile.path);
                return 'url(' + util.rebasePath(url, file.path, targetFile.path) + ')';
            }
            return match;
        });
    }

    return data;
};

/**
 * 获取当前要处理的文件的引用的文件路径的相对当前处理上下文的路径
 *
 * @param {string} path 路径
 * @param {string=} dir 相对的目录，可选，默认基于当前处理的文件目录
 * @return {string}
 */
Inliner.prototype.getRelativePath = function (path, dir) {
    var file = this.file;

    if (!dir) {
        dir = pathUtil.dirname(file.owner ? file.owner.path : file.path);
    }

    return util.normalizePath(pathUtil.join(dir, path));
};

/**
 * 将文件内容转成 data-uri 形式
 *
 * @param {Object} file 要处理的文件
 * @return {string}
 */
Inliner.prototype.toDataURI = function (file) {
    return helper.toDataURI(file.path, file.data);
};

/**
 * 获取内联结果
 *
 * @param {string|Object} inlinePath 要内联的文件的路径或者文件对象
 * @param {Object=} option 自定义的内联选项，可选
 * @return {Object}
 */
Inliner.prototype.getInlineResult = function (inlinePath, option) {
    option = _.merge({}, this.option, option || {});

    if (_.isPlainObject(inlinePath)) {
        return inline(inlinePath, option);
    }

    inlinePath && (inlinePath = inlinePath.trim());
    if (!inlinePath) {
        return;
    }

    // 初始化自定义的内联路径
    var pathInfo;
    if (option.inlinePathGetter) {
        pathInfo = option.inlinePathGetter.call(this, inlinePath, this.file);
        _.isString(pathInfo) && (pathInfo = {path: pathInfo, dir: '.'});
        inlinePath = pathInfo && pathInfo.path;
    }

    // 只处理本地路径
    if (!inlinePath || !util.isLocalPath(inlinePath)) {
        return;
    }

    // 判断是否需要内联
    var url = urlUtil.parse(inlinePath, true);
    var inlineFlag = option.inlineParamName;
    if (!option.inlineAll) {
        if (!url.query.hasOwnProperty(inlineFlag)) {
            return;
        }
    }

    var filePath = this.getRelativePath(
        inlinePath, pathInfo && pathInfo.dir || url.query[inlineFlag]
    );

    return inline(filePath, option);
};

/**
 * 执行所有内联任务
 *
 * @return {Object}
 */
Inliner.prototype.inline = function () {
    var me = this;
    var file = me.file;

    me.taskList.forEach(function (task) {
        file.data = task.call(me, file);
    });

    // 执行压缩
    if (!me.isIgnoreCompress(file) && me.compress) {
        file.compressed = true;
        file.data = me.compress(file, me.compressOption);
    }

    return file;
};

/**
 * 判断给定的文件是否忽略压缩
 *
 * @param {Object} file 要判断的文件
 * @return {boolean}
 */
Inliner.prototype.isIgnoreCompress = function (file) {
    return !this.enableCompress
        || util.isMatch(file.path, this.ignoreCompressFiles || [])
        || file.compressed;
};

/**
 * 内联静态资源
 *
 * @param {Object} options 内联选项
 * @param {string=} options.root 内联处理文件的根目录，可选，默认当前执行目录
 * @param {string=} options.output 输出目录，可选，默认不输出
 * @param {Array.<string|RegExp|Object>} options.files 要内联处理的文件，如果传入字符串，路径
 *        pattern 定义参考{@see https://github.com/isaacs/minimatch}，若为对象，结构：
 *        { data: string, path: string, fullPath: string, extname: string }，
 *        path 为相对于 `root` 的路径，extname 为文件的扩展名，不包括 `.`，为了保持路径风格一致性，
 *        路径统一 `/` 方式，windows 下是 `\`
 * @param {Array.<Object>=} options.allFiles 预读取的所有文件集合，结构同 files 传入对象
 *        时候的结构，可选
 * @param {function(Object):string=} options.processor 自定义文件的处理器类型，内置支持
 *        的处理器类型：`html` | `css` | `js` | `svg` | `img` | `font`，返回对应的文件
 *        处理器类型，可选，默认按文件的后缀名识别对应的处理器类型
 * @param {function(string, Object)=} options.inlinePathGetter 自定义的内联
 *        文件路径的获取方法，返回内联的文件路径相对于 `root`，或者 {path: string, dir: string}，
 *        `dir` 为 `path` 相对的目录，可选
 * @param {boolean=} options.inlineAll 是否内联指定的所有静态资源，默认 false，只有通过 url
 *        的查询参数 `options.inlineParamName` 指定的资源才内联
 * @param {string=} options.inlineParamName 内联参数名，默认 `_inline`，即 `options.inlineAll`
 *        为 `false` 情况，只有内联的 url 包含该参数：`a/b.css?_inline` 才会被内联处理，该参数值
 *        也可以作为内联路径的相对目录
 * @param {Array.<string|RegExp>=} options.ignoreCompressFiles 忽略压缩的文件 pattern，可选，
 *        默认开启压缩的所有文件都会压缩
 * @param {boolean=} options.img 是否内联处理图片，内联处理替换成 `data-uri` 形式，可选，默认 true
 * @param {boolean=} options.font 是否内联字体文件，内联处理替换成 `data-uri` 形式，可选，默认 true
 * @param {boolean|Object=} options.svg 是否内联 svg 文件，默认 true
 * @param {boolean=} options.svg.useSource 是否使用 源文件 形式内联，默认 false，使用 `data-uri` 方式
 * @param {boolean|Object=} options.svg.compress 是否内联时候进行压缩，压缩只针对
 *        `useSource` 为 true 情况，默认 false，也可以指定压缩的选项
 * @param {boolean|Object=} options.css 是否内联样式文件，包括 link 及 import 的样式文件，默认 true
 * @param {boolean|Object=} options.css.compress 是否内联样式时候进行压缩，默认 false，
 *        也可以指定压缩的选项
 * @param {boolean=} options.css.rebase 内联时候是否重新计算样式引用的 url 路径，可选，默认 false
 * @param {boolean|Object=} options.js 是否内联脚本文件，包括 script 及 document.write
 *        的脚本文件，默认 true
 * @param {boolean=} options.js.compress 是否内联脚本时候进行压缩，默认 false，也可以指定压缩的选项
 * @param {boolean=} option.js.custom 是否使用自定义内联的方法，默认 false，语法：
 *        var tpl = '__inline("./a.tpl")';
 * @param {boolean|Object=} options.html 是否内联 html 文件，包括 html5 link import 的文件，默认 true
 * @param {boolean=} options.html.compress 是否内联 html 时候进行压缩，默认 false，也可以指定压缩的选项
 * @return {Array.<Object>}
 */
Inliner.inline = function (options) {
    options || (options = {});
    options = _.merge({}, {
        root: process.cwd(),
        inlineParamName: '_inline',
        img: true,
        svg: true,
        font: true,
        css: true,
        js: true,
        html: true
    }, options);

    var processFiles = readInlineFiles(
        options.root, options.files, options.allFiles
    );

    processFiles.forEach(function (file) {
        var processor = getInlineProcessor(file, options);
        processor && processor.inline();
    });

    // 输出文件
    var outputDir = options.output;
    if (outputDir) {
        outputDir = pathUtil.join(options.root, outputDir);
        processFiles.forEach(function (file) {
            var outputPath = pathUtil.join(outputDir, file.path);
            debug('output file: %s', outputPath);
            util.mkdirsSyn(pathUtil.dirname(outputPath));
            fs.writeFileSync(outputPath, file.data);
        });
    }

    return processFiles;
};

/**
 * 注册内联处理器
 *
 * @param {...Function} processor 内联处理器
 */
Inliner.register = function () {
    [].slice.apply(arguments).forEach(function (processor) {
        Inliner[processor.prototype.type] = processor;
    });
};

module.exports = exports = Inliner;