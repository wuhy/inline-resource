var expect = require('expect.js');
var helper = require('./helper');
var inliner = require('../../index');

describe('inliner api', function () {
    it('should execute the custom inline task', function () {
        var htmlInlineTask = function (file) {
            var me = this;
            var inlineTplRegexp = /<!--\s*inline:\s*([^\s]+)\s*-->/g;
            return file.data.replace(inlineTplRegexp, function (match, path) {
                var result = me.getInlineResult(path);
                if (result) {
                    return result.data;
                }
                return match;
            });
        };
        inliner.addInlineTaskFor('html', htmlInlineTask);
        var jsInlineTask = function (file) {
            return file.data.replace(/\{|\}/g, function (match) {
                return {'{': '{ldelim}', '}': '{rdelim}'}[match];
            });
        };
        inliner.addInlineTaskFor('js', [
             jsInlineTask
        ]);
        var result = inliner.inline({
            inlineAll: true,
            files: [
                'test/fixtures/inliner/customTask.html'
            ],
            js: true
        });
        expect(result[0].data).to.eql(helper.readFileSync('inliner/out/customTask.html').toString());

        // remove the custom task
        inliner.removeInlineTask('js', jsInlineTask);
        inliner.removeInlineTask('html', htmlInlineTask);

        result = inliner.inline({
            inlineAll: true,
            files: [
                'test/fixtures/inliner/customTask.html'
            ],
            js: true
        });

        expect(result[0].data).to.eql(helper.readFileSync('inliner/out/without.customTask.html').toString());

    });

    it('should use the custom inline processor', function () {
        inliner.registerInlineProcessor('etpl', {
            taskList: [
                function (file) {
                    var me = this;
                    return file.data.replace(
                        /<!--\s*include:\s*([^\s]+)\s*-->/g,
                        function (match, path) {
                            var result = me.getInlineResult(path);
                            if (result) {
                                return result.data;
                            }
                            return match;
                        }
                    )
                }
            ],
            compress: function (file) {
                return file.data.trim();
            }
        });

        var result = inliner.inline({
            inlineAll: true,
            files: [
                'test/fixtures/inliner/custom.etpl'
            ]
        });
        expect(result[0].data == helper.readFileSync('inliner/out/custom.etpl').toString()).to.be(true);

    });
});
