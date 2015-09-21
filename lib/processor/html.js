/**
 * @file html 文件的内联分析处理器
 * @author sparklewhy@gmail.com
 */

var util = require('../util');
var helper = require('./helper');
var Inliner = require('./inliner');

/**
 * 提取内联脚本的正则
 *
 * @const
 * @type {RegExp}
 */
var SCRIPT_REGEXP = /(?=[^'"\s])(\s*<script)(\s+[^>]*?>|>)([\s\S]*?)(<\/script>\s*)(?=[^'"\s])/ig;

/**
 * 链接元素正则
 *
 * @const
 * @type {RegExp}
 */
var LINK_REGEXP = /<link\s+[^>]+?\/?>/ig;

/**
 * 样式元素正则
 *
 * @const
 * @type {RegExp}
 */
var STYLE_REGEXP = /(<style(?:\s+[^>]*?>|>))([\s\S]*?)(<\/style>)/mig;

/**
 * 图片元素正则
 *
 * @const
 * @type {RegExp}
 */
var IMG_REGEXP = /(<img\s*)(\s[^>]+?)\/?>/ig;

/**
 * 对象元素正则
 *
 * @const
 * @type {RegExp}
 */
var OBJECT_REGEXP = /(<object(?:\s+[^>]*?>|>))(.*?<\/object>)/mig;


/**
 * 内联脚本
 *
 * @param {Object} file 内联处理的文件
 * @return {string}
 */
function inlineScript(file) {
    var me = this;

    return file.data.replace(SCRIPT_REGEXP,
        function (match, startTag, tagAttr, content, endTag) {
            var srcRegexp = helper.getAttrRegexp('src');
            var src = srcRegexp.exec(tagAttr);
            src && (src = src[2]);

            var result;
            if (src) {
                result = me.getInlineResult(src);
                if (result) {
                    return startTag + tagAttr.replace(srcRegexp, '') + result.data + endTag;
                }
            }
            else {
                // 处理 script 脚本内容里的内联代码
                me.debug('process script content: %s', content);
                result = me.getInlineResult({
                    data: content,
                    owner: file,
                    path: file.path,
                    fullPath: file.fullPath,
                    type: 'js'
                });
                return startTag + tagAttr + result.data + endTag;
            }

            return match;
        }
    );
}

/**
 * 内联样式
 *
 * @param {Object} file 内联处理的文件
 * @return {string}
 */
function inlineStyle(file) {
    var me = this;

    return file.data.replace(STYLE_REGEXP,
        function (match, startTag, styleContent, endTag) {
            me.debug('style content: %s', styleContent);
            var result = me.getInlineResult({
                data: styleContent,
                owner: file,
                path: file.path,
                fullPath: file.fullPath,
                type: 'css'
            });

            return startTag + result.data + endTag;
        }
    ).replace(LINK_REGEXP, function (link) {
        if (helper.hasAttrValue(link, 'rel', 'stylesheet')) {
            me.debug('parse link: %s', link);
            var href = helper.getAttrRegexp('href').exec(link);
            href && (href = href[2]);
            me.debug('ready inline link style: %s', href);

            var result = me.getInlineResult(href);
            if (result) {
                var media = helper.getAttrRegexp('media').exec(link);
                media && (media = media[1]);
                media && (media = ' media="' + media + '"');
                media || (media = '');

                var data = me.rebaseCSS(result, file);
                return '<style' + media + '>' + data + '</style>';
            }
        }

        return link;
    });
}

/**
 * 内联 html
 *
 * @param {Object} file 内联处理的文件
 * @return {string}
 */
function inlineHtml(file) {
    var me = this;

    return file.data.replace(LINK_REGEXP, function (match, linkAttr) {
        if (helper.hasAttrValue(linkAttr, 'rel', 'import')) {
            var href = helper.getAttrRegexp('href').exec(linkAttr);
            href && (href = href[2]);
            var result = me.getInlineResult(href);

            if (result) {
                return result.data;
            }
            return match;
        }
    });
}

/**
 * 内联图片
 *
 * @param {Object} file 内联处理的文件
 * @return {string}
 */
function inlineImg(file) {
    var me = this;
    return file.data.replace(IMG_REGEXP, function (match, startTag, imgAttr) {
        var srcRegExp = helper.getAttrRegexp('src');
        var src = srcRegExp.exec(imgAttr);
        src && (src = src[2]);

        me.debug('inline img %s: %s', match, src);
        var result = me.getInlineResult(src);
        if (!result) {
            return match;
        }

        if (util.isSvg(src) && !result.uri) {
            // 非 data-uri 形式，直接源文件内联
            return result.data;
        }

        return startTag + imgAttr.replace(srcRegExp, function (match, attrName) {
                return attrName + '="' + result.data + '"';
            }) + '>';
    });
}

/**
 * 内联 svg
 *
 * @param {Object} file 内联处理的文件
 * @return {string}
 */
function inlineSvg(file) {
    var me = this;
    return file.data.replace(OBJECT_REGEXP, function (match, startTag, endTag) {
        var dataRegExp = helper.getAttrRegexp('data');
        var data = dataRegExp.exec(startTag);
        data && (data = data[2]);

        if (!data || !util.isSvg(data)) {
            return match;
        }

        var result = me.getInlineResult(data);
        if (!result) {
            return match;
        }

        if (result.uri) {
            return startTag.replace(dataRegExp, function (match, attrName) {
                return attrName + '="' + result.data + '"';
            }) + endTag;
        }
        return result.data;
    });
}

/**
 * 创建 html 内联处理器
 *
 * @extends Inliner
 * @constructor
 */
function HTMLInliner() {
    Inliner.apply(this, arguments);

    this.debug = require('debug')('html');
    this.file.data = this.file.data.toString();

    // 初始化内联任务
    var option = this.option;
    this.initInlineTasks([
        {enable: option.svg, task: inlineSvg},
        {enable: option.img, task: inlineImg},
        {enable: option.css, task: inlineStyle},
        {enable: option.html, task: inlineHtml},
        {enable: option.js, task: inlineScript}
    ]);
}

util.inherits(HTMLInliner, Inliner);

HTMLInliner.prototype.type = 'html';

/**
 * 进行 html 压缩
 *
 * @param {Object} file 压缩的文件
 * @param {Object} options 压缩选项
 * @return {string}
 */
HTMLInliner.prototype.compress = function (file) {
    return file.data.split(/\r?\n/g).map(function (row) {
        return row.trim();
    }).join('');
};

module.exports = exports = HTMLInliner;

