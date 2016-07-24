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
            output: 'output',
            files: [
                'test/fixtures/js/write.js',
                'test/fixtures/js/write2.js'
            ],
            js: {
                custom: false,
                compress: {
                    mangle: false
                }
            }
        });

        expect(result[0].data).to.eql(helper.readFileSync('js/out/write.compress.js').toString());
        expect(result[1].data).to.eql(helper.readFileSync('js/out/write2.compress.js').toString());
    });

    it('should inline custom inline file in js file', function () {
        var result = inliner.inline({
            inlineAll: true,
            files: [
                'test/fixtures/js/custom.js'
            ],
            css: true,
            img: true,
            js: true
        });

        expect(result[0].data).to.eql(helper.readFileSync('js/out/custom.js').toString());
    });
    it('should inline custom inline file and compress inline js/css in js file', function () {
        var result = inliner.inline({
            inlineAll: true,
            files: [
                'test/fixtures/js/custom.js'
            ],
            js: {
                compress: {
                    mangle: false
                }
            },
            html: {
                compress: true
            },
            css: {
                compress: true
            },
            img: true
        });

        expect(result[0].data).to.eql(helper.readFileSync('js/out/custom.compress.js').toString());
    });
});
