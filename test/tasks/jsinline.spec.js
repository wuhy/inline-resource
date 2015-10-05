var expect = require('expect.js');
var helper = require('./helper');
var inliner = require('../../index');

describe('js inliner', function () {
    it('should inline document.write js file', function () {
        var result = inliner.inline({
            inlineAll: true,
            files: [
                'test/fixtures/js/write.js',
                'test/fixtures/js/write2.js'
            ],
            js: {
                custom: false
            }
        });

        expect(result[0].data == helper.readFileSync('js/out/write.js').toString()).to.be(true);
        expect(result[1].data == helper.readFileSync('js/out/write2.js').toString()).to.be(true);
    });

    it('should inline and compress document.write js file', function () {
        var result = inliner.inline({
            inlineAll: true,
            files: [
                'test/fixtures/js/write.js',
                'test/fixtures/js/write2.js'
            ],
            js: {
                custom: false,
                compress: true
            }
        });

        expect(result[0].data == helper.readFileSync('js/out/write.compress.js').toString()).to.be(true);
        expect(result[1].data == helper.readFileSync('js/out/write2.compress.js').toString()).to.be(true);
    });

    it('should inline custom inline file in js file', function () {
        var result = inliner.inline({
            inlineAll: true,
            files: [
                'test/fixtures/js/custom.js'
            ]
        });

        expect(result[0].data == helper.readFileSync('js/out/custom.js').toString()).to.be(true);
    });
    it('should inline custom inline file and compress inline js/css in js file', function () {
        var result = inliner.inline({
            inlineAll: true,
            files: [
                'test/fixtures/js/custom.js'
            ],
            js: {
                compress: true
            },
            html: {
                compress: true
            },
            css: {
                compress: true
            }
        });

        expect(result[0].data == helper.readFileSync('js/out/custom.compress.js').toString()).to.be(true);
    });
});
