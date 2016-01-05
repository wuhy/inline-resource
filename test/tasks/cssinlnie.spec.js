var expect = require('expect.js');
var helper = require('./helper');
var inliner = require('../../index');

describe('css inliner', function () {
    it('should import css file', function () {
        var result = inliner.inline({
            inlineAll: true,
            files: [
                'test/fixtures/css/import.css'
            ]
        });

        expect(result[0].data).to.eql(helper.readFileSync('css/out/import.css').toString());
    });

    it('should import and compress css file', function () {
        var result = inliner.inline({
            inlineAll: true,
            files: [
                'test/fixtures/css/import.css'
            ],
            css: {
                compress: true
            }
        });

        expect(result[0].data).to.eql(
            helper.readFileSync('css/out/import.compress.css').toString()
        );
    });

    it('should import and rebase css file', function () {
        var result = inliner.inline({
            inlineAll: true,
            files: [
                'test/fixtures/css/import.css'
            ],
            css: {
                rebase: true
            },
            img: false
        });

        expect(result[0].data).to.eql(
            helper.readFileSync('css/out/import.rebase.css').toString()
        );
    });

    it('should import css file with media query', function () {
        var result = inliner.inline({
            inlineAll: true,
            files: [
                'test/fixtures/css/import.media.css'
            ],
            img: false
        });

        expect(result[0].data).to.eql(
            helper.readFileSync('css/out/import.media.css').toString()
        );
    });

    it('should inline font file', function () {
        var result = inliner.inline({
            inlineAll: true,
            files: [
                'test/fixtures/css/font.css'
            ]
        });

        expect(result[0].data).to.eql(helper.readFileSync('css/out/font.css').toString());
    });

    it('should inline limit font file', function () {
        var result = inliner.inline({
            inlineAll: true,
            font: {
                limit: 1024
            },
            files: [
                'test/fixtures/css/font.css'
            ]
        });
        expect(result[0].data).to.eql(helper.readFileSync('css/out/font-limit1.css').toString());

        result = inliner.inline({
            inlineAll: true,
            output: 'output',
            font: {
                limit: 1024 * 1.4
            },
            files: [
                'test/fixtures/css/font.css'
            ]
        });
        expect(result[0].data).to.eql(helper.readFileSync('css/out/font-limit2.css').toString());
    });

    it('should inline svg file', function () {
        var result = inliner.inline({
            inlineAll: true,
            files: [
                'test/fixtures/css/svg.css'
            ]
        });

        expect(result[0].data).to.eql(
            helper.readFileSync('css/out/svg.css').toString()
        );
    });

});
