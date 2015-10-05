/**
 * @file 工具方法定义
 * @author sparklewhy@gmail.com
 */

var path = require('path');
var util = require('util');
var _ = require('lodash');
var minimatch = require('minimatch');

_.extend(
    exports, require('./util/file-util')
);

/**
 * 判断给定的路径是否匹配给定的 pattern
 *
 * @param {string} path 要匹配的路径
 * @param {RegExp|string|Array} patterns 匹配的正则或者 `minimatch` 支持的 pattern
 * @return {boolean}
 */
exports.isMatch = function (path, patterns) {
    if (!Array.isArray(patterns)) {
        patterns = [patterns];
    }

    return patterns.some(function (p) {
        if (_.isRegExp(p)) {
            return p.test(path);
        }

        return minimatch(path, p, {matchBase: true});
    });
};

/**
 * 查找数组中满足给定的 key/value 的项
 *
 * @param {string} key 要查找的项的 key 名称
 * @param {*} value 要查找的项满足的 key 的值
 * @param {Array.<Object>} arr 查找的目标数组
 * @return {?Object}
 */
exports.findItem = function (key, value, arr) {
    var foundItem;

    arr.some(function (item) {
        var result = item[key] === value;
        result && (foundItem = item);
        return result;
    });

    return foundItem;
};

/**
 * 规范化给定的文件路径
 *
 * @param {string} srcPath 路径
 * @return {string}
 */
exports.normalizePath = function (srcPath) {
    return path.normalize(srcPath).replace(/\\/g, '/');
};

/**
 * 继承
 */
exports.inherits = util.inherits;
