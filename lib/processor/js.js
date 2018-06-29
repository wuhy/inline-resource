/**
 * @file js 文件的内联分析处理器
 * @author sparklewhy@gmail.com
 */

var util = require('../util');
var Inliner = require('./inliner');
var helper = require('./helper');

/**
 * document.write 的正则定义
 *
 * @const
 * @type {RegExp}
 */
var DOCUMENT_WRITE_REGEXP = helper.DOCUMENT_WRITE_REGEXP;

/**
 * 内联脚本
 *
 * @param {Object} file 内联处理的文件
 * @return {string}
 */
function inlineJS(file) {
    var me = this;
    return file.data.replace(DOCUMENT_WRITE_REGEXP, function (match, comment, script) {
        me.debug('inline document.write: %s, script: %s', match, script);
        if (comment) {
            return match;
        }

        var srcRegexp = helper.getAttrRegexp('src');
        var src = srcRegexp.exec(script);
        src && (src = src[2]);

        if (src) {
            var result = me.getInlineResult(src);
            if (result) {
                return result.data;
            }
        }

        return match;
    });
}

/**
 * 创建 js 内联处理器
 *
 * @extends Inliner
 * @constructor
 */
function JSInliner() {
    Inliner.apply(this, arguments);

    this.file.data = this.file.data.toString();

    // 初始化内联任务
    var option = this.option;
    this.initInlineTasks([
        {enable: option.js, task: inlineJS},
        {enable: option.js && option.js.custom, task: this.customInline}
    ]);
}

util.inherits(JSInliner, Inliner);

JSInliner.prototype.type = 'js';

/**
 * 进行 js 压缩
 *
 * @param {Object} file 压缩的文件
 * @param {Object} options 压缩选项
 * @return {string}
 */
JSInliner.prototype.compress = function (file, options) {
    try {
        var compressOpt = Object.assign({}, options);
        var result = util.require('uglify-js').minify(file.data, compressOpt);
        if (result.error) {
            console.error('compress', file.path, result.error);
            return file.data;
        }
        return result.code;
    }
    catch (ex) {
        this.debug('compress error: %s', ex);
        return file.data;
    }
};

module.exports = exports = JSInliner;


