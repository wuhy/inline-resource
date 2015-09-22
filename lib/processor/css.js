/**
 * @file css 文件的内联分析处理器
 * @author sparklewhy@gmail.com
 */

var _ = require('lodash');
var pathUtil = require('path');
var urlUtil = require('url');
var util = require('../util');
var helper = require('./helper');
var Inliner = require('./inliner');

/**
 * 提取 import 样式的正则
 *
 * @const
 * @type {RegExp}
 */
var IMPORT_REGEXP = /@import\s+(?:url\s*\(\s*)?['"]?\s*([^\s'"\(\)]+)\s*['"]?(?:\s*\))?([^;]*);/g;

/**
 * 用于提取样式中 url 属性值里包含的链接
 *
 * @type {RegExp}
 * @const
 */
var CSS_URL_REGEXP = helper.CSS_URL_REGEXP;

/**
 * 内联样式
 *
 * @param {Object} file 内联处理的文件
 * @return {string}
 */
function inlineStyle(file) {
    var me = this;

    return file.data.replace(IMPORT_REGEXP,
        function (match, url, mediaQuery) {
            me.debug('import: %s', match);
            var result = me.getInlineResult(url);

            if (!result) {
                return match;
            }

            var data = me.rebaseCSS(result, file);

            mediaQuery = mediaQuery.trim();
            if (mediaQuery) {
                return '@media ' + mediaQuery + ' {' + data + '}';
            }

            return data;
        }
    );
}

/**
 * 获取图片、字体文件、svg 资源内联处理任务
 *
 * @param {function(string):boolean} filter 资源类型是否符合的检查方法
 * @return {Function}
 */
function getInlineResourceTask(filter) {
    return function (file) {
        var me = this;
        return file.data.replace(CSS_URL_REGEXP, function (match, url) {
            if (!filter(urlUtil.parse(url, true).pathname)) {
                return match;
            }

            me.debug('match resource url: %s', match);
            var result = me.getInlineResult(url, {svg: {useSource: false}});
            if (result) {
                return 'url(' + result.data + ')';
            }
            return match;
        });
    };
}

/**
 * 创建 css 内联处理器
 *
 * @extends Inliner
 * @constructor
 */
function CSSInliner() {
    Inliner.apply(this, arguments);

    this.debug = require('debug')('css');
    this.file.data = this.file.data.toString();

    // 初始化内联任务
    var option = this.option;
    var filter = function (url) {
        var inlineImg = option.img && util.isImg(url);
        var inlineSvg = option.svg && util.isSvg(url);
        var inlineFont = option.font && util.isFont(url);
        return inlineImg || inlineSvg || inlineFont;
    };
    this.initInlineTasks([
        {
            enable: option.img || option.svg || option.font,
            task: getInlineResourceTask(filter)
        },
        {enable: option.css, task: inlineStyle}
    ]);
}

util.inherits(CSSInliner, Inliner);

CSSInliner.prototype.type = 'css';

/**
 * 进行 css 压缩
 *
 * @param {Object} file 压缩的文件
 * @param {Object} options 压缩选项
 * @return {string}
 */
CSSInliner.prototype.compress = function (file, options) {
    var defaultOption = {
        advanced: false,
        aggressiveMerging: false,
        shorthandCompacting: false,
        compatibility: 'ie7',
        keepBreaks: true,
        relativeTo: pathUtil.dirname(file.fullPath)
    };

    var CleanCSS = require('clean-css');
    var clean = new CleanCSS(_.extend(defaultOption, options));
    return clean.minify(file.data).styles;
};

module.exports = exports = CSSInliner;
