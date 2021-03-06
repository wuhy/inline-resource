/**
 * @file font 文件的内联分析处理器
 * @author sparklewhy@gmail.com
 */

var util = require('../util');
var Inliner = require('./inliner');

/**
 * 创建 font 内联处理器
 *
 * @extends Inliner
 * @constructor
 */
function FontInliner() {
    Inliner.apply(this, arguments);

    this.debug = require('debug')('font');

    // 初始化内联任务
    var fontOpt = this.option.font;
    (fontOpt === true) && (fontOpt = {});
    var file = this.file;
    this.initInlineTasks([
        {
            enable: function () {
                if (fontOpt && fontOpt.limit) {
                    return file.size <= fontOpt.limit;
                }
                return !!fontOpt;
            },
            task: this.toDataURI
        }
    ]);
}

util.inherits(FontInliner, Inliner);

FontInliner.prototype.type = 'font';

module.exports = exports = FontInliner;


