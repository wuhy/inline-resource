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

    // 初始化内联任务
    var imgOpt = this.option.img;
    var file = this.file;
    this.initInlineTasks([
        {
            enable: function () {
                if (imgOpt && imgOpt.limit) {
                    return file.size <= imgOpt.limit;
                }
                return !!imgOpt;
            },
            task: this.toDataURI
        }
    ]);
}

util.inherits(ImageInliner, Inliner);

ImageInliner.prototype.type = 'img';

module.exports = exports = ImageInliner;

