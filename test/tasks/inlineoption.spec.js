var fs = require('fs');
var expect = require('expect.js');
var helper = require('./helper');
var inliner = require('../../index');

describe('inline option', function () {
    it('support regexp inline file path', function () {
        var result = inliner.inline({
            inlineAll: true,
            files: [
                /test\/fixtures\/regexp\/[^\/]*\.html$/
            ]
        });

        expect(result.length).to.be(2);
        expect(result[0].data == helper.readFileSync('regexp/out/index.html').toString()).to.be(true);
        expect(result[1].data == helper.readFileSync('regexp/out/main.html').toString()).to.be(true);
    });

    it('should inline file with specified inline param', function () {
        var result = inliner.inline({
            files: [
                'test/fixtures/specify/specify.html'
            ],
            inlineParamName: '__inline'
        });

        expect(result[0].data == helper.readFileSync('specify/out/specify.html').toString()).to.be(true);
    });

    it('should inline file with default inline param', function () {
        var result = inliner.inline({
            files: [
                'test/fixtures/specify/default.specify.html'
            ]
        });

        expect(result[0].data == helper.readFileSync('specify/out/default.specify.html').toString()).to.be(true);
    });

    it('should compute inline file path based on the inlinePathGetter', function () {
        var result = inliner.inline({
            inlineAll: true,
            files: [
                'test/fixtures/path/customPath.tpl',
                'test/fixtures/path/views/server.tpl',
                'test/fixtures/path/js/specify.context.js'
            ],
            inlinePathGetter: function (path, file) {
                var newPath = path.replace(/{%site_host%}\//, '');
                var dir;
                if (file.path.indexOf('test/fixtures/path/views/') === 0) {
                    dir = 'test/fixtures/path';
                }

                return {path: newPath, dir: dir};
            }
        });

        expect(result[0].data == helper.readFileSync('path/out/customPath.tpl').toString()).to.be(true);
        expect(result[2].data == helper.readFileSync('path/out/views/server.tpl').toString()).to.be(true);
        expect(result[1].data == helper.readFileSync('path/out/js/specify.context.js').toString()).to.be(true);
    });

    it('process file inline using the specified processor', function () {
        var result = inliner.inline({
            inlineAll: true,
            files: [
                'test/fixtures/processor/customTpl.mustache'
            ],
            processor: {
                mustache: 'html'
            }
        });

        expect(result[0].data == helper.readFileSync('processor/out/customTpl.mustache').toString()).to.be(true);
    });

    it('should disable the file compress specified in ignoreCompressFiles param', function () {
        var result = inliner.inline({
            inlineAll: true,
            files: [
                'test/fixtures/compress/compress.html'
            ],
            ignoreCompressFiles: [
                '*.min.js'
            ],
            js: {
                compress: true
            }
        });

        expect(result[0].data == helper.readFileSync('compress/out/compress.html').toString()).to.be(true);
    });

    it('should output the inline result to the target directory specified in output param', function () {
        var target = 'test/fixtures/output/tmp';
        var processFile = 'test/fixtures/output/index.html';
        inliner.inline({
            inlineAll: true,
            files: [
                processFile
            ],
            output: target
        });

        var outputFile = target + '/' + processFile;
        expect(fs.statSync(outputFile).isFile()).to.be(true);

        helper.unlinkDirectory(target);
    });

    it('should read file from specified file map', function () {
        var fileMap  = {};
        fileMap['test/fixtures/filemap/js/a.js'] = helper.readFileSync('filemap/a.js');
        fileMap['test/fixtures/filemap/js/a.css'] = helper.readFileSync('filemap/a.css');
        fileMap['test/fixtures/img/bookmark.png'] = helper.readFileSync('img/bookmark.png');
        fileMap['test/fixtures/filemap/index.html'] = helper.readFileSync('filemap/index.html');

        var result = inliner.inline({
            inlineAll: true,
            files: [
                'test/fixtures/filemap/index.html'
            ],
            fileMap: fileMap
        });
        console.log(result[0].data);
        var expectedResult = helper.readFileSync('filemap/out/index.html').toString();
        console.log(expectedResult);
        expect(result[0].data == expectedResult).to.be(true);
    });

});
