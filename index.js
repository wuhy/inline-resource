/**
 * @file 内联静态资源的入口模板
 * @author sparklewhy@gmail.com
 */

var _ = require('lodash');
var Inliner = require('./lib/processor/inliner');

// 注册预定义的内联处理器
Inliner.register(
    require('./lib/processor/css'),
    require('./lib/processor/font'),
    require('./lib/processor/html'),
    require('./lib/processor/img'),
    require('./lib/processor/js'),
    require('./lib/processor/svg')
);

exports.inline = Inliner.inline;

/**
 * 增加自定义的内联任务方法
 *
 * @param {string} type 内联的处理器类型，`html` | `js` | `css` | `img` | `font` | `svg`
 * @param {function(Object, Object, Function):string} task，增加的内联任务
 */
exports.addInlineTaskFor = function (type, task) {
    var processor = Inliner[type];
    if (processor) {
        processor.addInlineTask(task);
    }
    else {
        console.error('the specified type %s is not found', type);
    }
};

/**
 * 注册内联处理器
 *
 * @param {string} type 处理器类型名
 * @param {Object} processor 处理器，e.g.,
 *        {
 *          taskList: [
 *              function (file) {
 *                  var me = this;
 *                  return file.data.replace(
 *                      /<tpl\s+src="([^"]+)">/g,
 *                      function (match, path) {
 *                          var result = me.getInlineResult(path);
 *                          return result ? result.data : match;
 *                      }
 *                   );
 *              }
 *          ],
 *          compress: function (file, option) {
 *
 *          }
 *        }
 */
exports.registerInlineProcessor = function (type, processor) {
    if (!$.isObject(processor)) {
        return;
    }

    function CustomProcessor() {
        Inliner.apply(this, arguments);

        var taskList = processor.taskList;
        taskList = taskList.map(function (task) {
            return {enable: true, task: task};
        });
        this.initInlineTasks(taskList);
    }

    require('util').inherits(CustomProcessor, Inliner);

    CustomProcessor.prototype.type = type;

    var proto = _.merge({}, processor);
    delete proto.taskList;
    _.extend(CustomProcessor.prototype, proto);

    Inliner.register(CustomProcessor);
};

