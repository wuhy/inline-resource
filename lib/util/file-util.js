/**
 * @file 文件相关的工具方法
 * @author sparklewhy@gmail.com
 */

var fs = require('fs');
var pathUtil = require('path');

/**
 * 获取给定文件路径的扩展名称，不包含 `.`
 *
 * @param  {string} filePath 文件路径
 * @return {string}
 */
exports.getFileExtName = function (filePath) {
    return pathUtil.extname(filePath).slice(1);
};

/**
 * 判断给定的路径是不是本地路径
 *
 * @param {string} filePath 要判断的文件路径
 * @return {boolean}
 */
exports.isLocalPath = function (filePath) {
    return !(/^\/\//.test(filePath) || /^[a-z][a-z0-9\+\-\.]+:/i.test(filePath));
};

/**
 * 判断给定的文件路径是否是相对路径
 *
 * @param {string} path 文件路径
 * @return {boolean}
 */
exports.isRelativePath = function (path) {
    path = pathUtil.normalize(path);
    return pathUtil.resolve(path) !== path;
};

/**
 * 判断给定的文件路径是否是绝对路径
 *
 * @param {string} path 文件路径
 * @return {boolean}
 */
exports.isAbsolutePath = function (path) {
    return !exports.isRelativePath(path);
};

/**
 * 重新计算文件的相对路径
 *
 * @param {string} filePath 当前引用的文件路径
 * @param {string} referFilePath 引用该文件的路径
 * @param {string} rebaseFilePath 重新调整的目标文件路径
 * @return {string}
 */
exports.rebasePath = function (filePath, referFilePath, rebaseFilePath) {
    var relativeDir = pathUtil.relative(pathUtil.dirname(rebaseFilePath), pathUtil.dirname(referFilePath));
    return pathUtil.join(relativeDir, filePath);
};


/**
 * 递归遍历文件
 *
 * @param {string} dir 遍历的目录
 * @param {function (string)} callback 要执行的回调
 */
exports.traverseFileSync = function (dir, callback) {
    var files = fs.readdirSync(dir);
    files.forEach(function (fileName) {
        var f = pathUtil.resolve(dir, fileName);
        var stat = fs.statSync(f);

        if (stat.isDirectory()) {
            exports.traverseFileSync(f, callback);
        }
        else {
            callback(f);
        }
    });
};

/**
 * 同步创建给定的目录路径，如果路径中存在某一目录不存在，会尝试创建
 *
 * @param {string} path 路径 要创建目录的路径
 * @param {number=} mode 创建的目录的权限，可选
 */
exports.mkdirsSyn = function (path, mode) {

    // 初始化未存在目录的路径
    var checkPath = path;
    var toMkdirs = [];
    while (checkPath && !fs.existsSync(checkPath)) {
        toMkdirs.push(checkPath);
        checkPath = pathUtil.dirname(checkPath);
    }

    // 按路径深度逐一创建不存在的目录
    for (var i = toMkdirs.length - 1; i >= 0; i--) {
        fs.mkdirSync(toMkdirs[i], mode);
    }
};

/**
 * 文件类型 map 定义
 *
 * @type {Object}
 */
var FILE_TYPE_MAP = {
    html: ['html', 'xhtml', 'htm', 'tpl'],
    css: ['css', 'styl', 'less', 'sass', 'scss'],
    js: ['js', 'coffee', 'ts', 'dart'],
    img: ['png', 'jpg', 'gif', 'webp', 'bmp'],
    font: ['ttf', 'otf', 'woff', 'eot'],
    svg: ['svg']
};

/**
 * 判断给定的文件路径是否符合给定的文件扩展名
 *
 * @inner
 * @param {Array.<string>} extNames 文件扩展名数组
 * @param {string} filePath 文件的路径
 * @return {boolean}
 */
function isFileTypeOf(extNames, filePath) {
    var extName = exports.getFileExtName(filePath).toLowerCase();
    return extNames.indexOf(extName) !== -1;
}

// 初始化对外暴露的 isXXX 方法
Object.keys(FILE_TYPE_MAP).forEach(function (type) {
    var key = type.replace(/^\w/, function (w) {
        return w.toUpperCase();
    });
    exports['is' + key] = function (filePath) {
        return isFileTypeOf(FILE_TYPE_MAP[type], filePath);
    };
});

/**
 * 获取文件类型
 *
 * @param {string} filePath 要判断的文件路径
 * @return {?string}
 */
exports.getFileType = function (filePath) {
    var keys = Object.keys(FILE_TYPE_MAP);
    var type;

    keys.some(function (k) {
        var result = isFileTypeOf(FILE_TYPE_MAP[k], filePath);
        result && (type = k);
        return result;
    });

    return type;
};
