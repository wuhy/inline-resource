/**
 * @file svg 文件的内联分析处理器
 * @author sparklewhy@gmail.com
 */

var util = require('../util');
var Inliner = require('./inliner');

/**
 * 创建 svg 内联处理器
 *
 * @extends Inliner
 * @constructor
 */
function SvgInliner() {
    Inliner.apply(this, arguments);

    // 初始化内联任务
    var option = this.option;
    var useDataURI = !((option.svg || {}).useSource);
    this.file.uri = useDataURI;
    this.initInlineTasks([
        {enable: useDataURI, task: this.toDataURI}
    ]);
}

util.inherits(SvgInliner, Inliner);

SvgInliner.prototype.type = 'svg';

/**
 * 进行 svg 压缩
 *
 * @param {Object} file 压缩的文件
 * @param {Object} options 压缩选项
 * @return {string}
 */
SvgInliner.prototype.compress = function (file, options) {
    var data = file.data;

    if (file.uri) {
        return data;
    }

    try {
        var SVGO = util.require('svgo');
        var compressResult;
        (new SVGO(options)).optimize(data.toString(), function (result) {
            compressResult = result.data;
        });

        return compressResult || data;
    }
    catch (ex) {
        this.debug('compress error: %s', ex);
        return data;
    }
};

module.exports = exports = SvgInliner;


