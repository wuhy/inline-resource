/**
 * @file 工具方法定义
 * @author sparklewhy@gmail.com
 */

var path = require('path');
var util = require('util');
var minimatch = require('minimatch');

Object.assign(exports, require('./util/file-util'));

exports.isRegExp = function (value) {
    return Object.prototype.toString.call(value) === '[object RegExp]';
};

exports.isFunction = function (value) {
    return Object.prototype.toString.call(value) === '[object Function]';
};

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
        if (exports.isRegExp(p)) {
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
 * 继承
 */
exports.inherits = util.inherits;

/**
 * 加载模块
 *
 * @param {string} modulename 要加载的模块名
 * @return {*}
 */
exports.require = function (modulename) {
    var local = path.join(process.cwd(), 'node_modules');
    var global = path.dirname(__dirname);
    var paths = [local];

    var resolve = require('resolve');
    if (local !== global) {
        paths.push(global);
    }
    var modulePath;
    paths.some(function (dir) {
        try {
            modulePath = resolve.sync(modulename, {basedir: dir});
        }
        catch (e) {}

        if (modulePath) {
            return true;
        }
        return false;
    });

    try {
        return modulePath ? require(modulePath) : require(modulename);
    }
    catch (ex) {
        return null;
    }
};
