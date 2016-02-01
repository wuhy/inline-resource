/**
 * @file 一些辅助处理内联文件的工具方法
 * @author sparklewhy@gmail.com
 */

/**
 * 用于提取样式中 url 属性值里包含的链接
 *
 * @const
 * @type {RegExp}
 */
exports.CSS_URL_REGEXP = /url\s*\(\s*['"]?\s*([^'"\)]+)\s*['"]?\s*\)/g;

/**
 * 提取 import 样式的正则
 *
 * @const
 * @type {RegExp}
 */
exports.CSS_IMPORT_REGEXP = /@import\s+(?:url\s*\(\s*)?['"]?\s*([^'"\)]+)\s*['"]?(?:\s*\))?([^;]*);/g;

/**
 * 链接元素正则
 *
 * @const
 * @type {RegExp}
 */
exports.LINK_REGEXP = /(<!--[\s\S]*?)(?:-->|$)|<link\s+[^>]+?\/?>/ig;

/**
 * 图片元素正则
 *
 * @const
 * @type {RegExp}
 */
exports.IMG_REGEXP = /(<img\s*)(\s[^>]+?)\/?>/ig;

/**
 * 对象元素正则
 *
 * @const
 * @type {RegExp}
 */
exports.OBJECT_REGEXP = /(<object(?:\s+[^>]*?>|>))([\s\S]*?<\/object>)/ig;

/**
 * 样式元素正则
 *
 * @const
 * @type {RegExp}
 */
exports.STYLE_REGEXP = /(<style(?:\s+[^>]*?>|>))([\s\S]*?)(<\/style>)/ig;

/**
 * 提取内联脚本的正则
 *
 * @const
 * @type {RegExp}
 */
exports.SCRIPT_REGEXP = /(<!--[\s\S]*?)(?:-->|$)|(?=[^'"\s])(\s*<script)(\s+[^>]*?>|>)([\s\S]*?)(<\/script>\s*)(?=[^'"\s])/ig;

/**
 * document.write 的正则定义
 *
 * @const
 * @type {RegExp}
 */
exports.DOCUMENT_WRITE_REGEXP = /((?:\/\*[\s\S]*?\*\/)|(?:\/\/.*))|document\.write\s*\(\s*['"]([\s\S]+?)['"]\s*\)\s*;?/g;

/**
 * 自定义内联方法的正则定义
 *
 * @const
 * @type {RegExp}
 */
exports.CUSTOM_INLINE_REGEXP = /(\s*\=\s*)?['"]__inline\((\\?['"])([^'"]+)\2\)['"]/g;

/**
 * 获取 html 属性值提取的正则
 *
 * @param {string} attrName 属性名
 * @return {RegExp}
 */
exports.getAttrRegexp = function (attrName) {
    return new RegExp('(\\s+' + attrName + '\\s*)=\\s*[\'"]([^\'"]+)[\'"]', 'i');
};

/**
 * 判断给定的 html tag 的属性值串是否包含给定的属性值
 *
 * @param {string} attrStr 要判断的 tag 属性字符串
 * @param {string} attrName 属性名
 * @param {string} attrValue 属性值
 * @return {boolean}
 */
exports.hasAttrValue = function (attrStr, attrName, attrValue) {
    var attrValueRegExp = new RegExp('\\s*' + attrName + '\\s*=\\s*[\'"]' + attrValue + '[\'"]', 'i');
    return attrValueRegExp.test(attrStr);
};

/**
 * 将给定的文件内容编码成 base64 data-uri 形式
 *
 * @param {string} filePath 编码的文件路径
 * @param {string} fileContent 编码的文件内容
 * @return {string}
 */
exports.toDataURI = function (filePath, fileContent) {
    var type = require('mime').lookup(filePath);
    var base64 = new Buffer(fileContent, 'utf8').toString('base64');
    return 'data:' + type + ';base64,' + base64;
};

/**
 * text 转 js 字符串
 *
 * @param {string} data 数据内容
 * @return {string}
 */
exports.text2JS = function (data) {
    var content = data.replace(/(['\\])/g, '\\$1');
    content = '\n' + content;

    var rowArr = [];
    content.split(/\r?\n/g).forEach(function (row, index) {
        row = row.trimRight();

        // 除了第一行外，忽略所有空白行
        if (index === 0 || row.trimLeft().length) {
            rowArr.push(row.replace(/(^\s*)/, '$1\'') + '\'');
        }
    });

    return rowArr.join('\n    + ');
};
