/**
 * @file 图片 文件的内联分析处理器
 * @author sparklewhy@gmail.com
 */

var util = require('../util');
var Inliner = require('./inliner');

/**
 * 创建 图片 内联处理器
 *
 * @extends Inliner
 * @constructor
 */
function ImageInliner() {
    Inliner.apply(this, arguments);

    this.debug = require('debug')('img');

    // 初始化内联任务
    var option = this.option;
    this.initInlineTasks([
        {enable: option.font, task: this.toDataURI}
    ]);
}

util.inherits(ImageInliner, Inliner);

ImageInliner.prototype.type = 'img';

module.exports = exports = ImageInliner;

