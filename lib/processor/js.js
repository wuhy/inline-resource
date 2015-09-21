/**
 * @file js 文件的内联分析处理器
 * @author sparklewhy@gmail.com
 */

var urlUtil = require('url');
var _ = require('lodash');
var util = require('../util');
var Inliner = require('./inliner');
var helper = require('./helper');

/**
 * document.write 的正则定义
 *
 * @const
 * @type {RegExp}
 */
var DOCUMENT_WRITE_REGEXP = /document\.write\s*\(\s*['"](.+)['"]\s*\)\s*;/g;

/**
 * 自定义内联方法的正则定义
 *
 * @const
 * @type {RegExp}
 */
var CUSTOM_INLINE_REGEXP = /['"]__inline\(['"]([^'"]+)['"]\)['"]/g;

/**
 * 内联脚本
 *
 * @param {Object} file 内联处理的文件
 * @return {string}
 */
function inlineJS(file) {
    var me = this;
    return file.data.replace(DOCUMENT_WRITE_REGEXP, function (match, script) {
        me.debug('inline document.write: %s, script: %s', match, script);
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
 * 自定义内联处理任务
 *
 * @param {Object} file 内联处理的文件
 * @return {string}
 */
function customInline(file) {
    var me = this;

    return file.data.replace(CUSTOM_INLINE_REGEXP, function (match, path) {
        // 初始化内联参数
        var query = urlUtil.parse(path, true).query;
        var inlineParamName = me.option.inlineParamName;
        if (!query || !query.hasOwnProperty(inlineParamName)) {
            path += query ? '&' : '?';
            path += inlineParamName;
        }

        var result = me.getInlineResult(path);
        if (result) {
            return helper.text2JS(result.data);
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

    this.debug = require('debug')('js');
    this.file.data = this.file.data.toString();

    // 初始化内联任务
    var option = this.option;
    this.initInlineTasks([
        {enable: option.js, task: inlineJS},
        {enable: option.js && option.js.custom, task: customInline}
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
    var compressOpt = _.extend({}, options, {fromString: true});
    return require('uglify-js').minify(file.data, compressOpt).code;
};

module.exports = exports = JSInliner;


