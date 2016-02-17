var expect = require('expect.js');
var helper = require('./helper');
var inliner = require('../../index');

describe('css inliner', function () {
    it('should import css file', function () {
        var result = inliner.inline({
            inlineAll: true,
            files: [
                'test/fixtures/css/import.css'
            ],
            img: true,
            css: true
        });

        expect(result[0].data).to.eql(helper.readFileSync('css/out/import.css').toString());
    });

    it('should import and compress css file', function () {
        var result = inliner.inline({
            inlineAll: true,
            files: [
                'test/fixtures/css/import.css'
            ],
            img: true,
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

    it('should import and rebase css file including imageset/src', function () {
        var result = inliner.inline({
            inlineAll: true,
            files: [
                'test/fixtures/css/rebase2.css'
            ],
            css: {
                rebase: true
            },
            img: false
        });

        expect(result[0].data).to.eql(
            helper.readFileSync('css/out/import.rebase2.css').toString()
        );
    });

    it('should import and rebase css file path to absolute', function () {
        var result = inliner.inline({
            inlineAll: true,
            files: [
                'test/fixtures/css/rebase3.css'
            ],
            css: {
                rebase: {absolute: true}
            },
            img: false
        });

        expect(result[0].data).to.eql(
            helper.readFileSync('css/out/import.rebase3.css').toString()
        );
    });

    it('should import and rebase css file path using custom rebase func', function () {
        var result = inliner.inline({
            inlineAll: true,
            files: [
                'test/fixtures/css/rebase4.css'
            ],
            css: {
                rebase: function (url, relativeFile, targetFile) {
                    if (url.startsWith('http://')) {
                        expect(this.isLocal(url)).to.be(false);
                        expect(this.resolve(url, relativeFile)).to.eql(url);
                        expect(this.rebase(url, relativeFile, targetFile)).to.eql(url);
                        return 'http://rebase.com/xx.jpg';
                    }
                    return url;
                }
            },
            img: false
        });

        expect(result[0].data).to.eql(
            helper.readFileSync('css/out/import.rebase4.css').toString()
        );
    });

    it('should import and rebase css file path using ingore option', function () {
        var result = inliner.inline({
            inlineAll: true,
            files: [
                'test/fixtures/css/rebase5.css'
            ],
            css: {
                rebase: {
                    ignore: function (url, referFilePath, targetFilePath) {
                        expect(referFilePath).to.eql('test/fixtures/css/import/rebase5.css');
                        expect(targetFilePath).to.eql('test/fixtures/css/rebase5.css');
                        if (url.indexOf('{%myHost%}') !== -1) {
                            return true;
                        }
                    },
                    absolute: true
                }
            },
            img: false
        });

        expect(result[0].data).to.eql(
            helper.readFileSync('css/out/import.rebase5.css').toString()
        );
    });


    it('should import css file with media query', function () {
        var result = inliner.inline({
            inlineAll: true,
            files: [
                'test/fixtures/css/import.media.css'
            ],
            img: false,
            css: true
        });

        expect(result[0].data).to.eql(
            helper.readFileSync('css/out/import.media.css').toString()
        );
    });

    it('should inline font file', function () {
        var result = inliner.inline({
            inlineAll: true,
            font: true,
            svg: true,
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
            svg: true,
            files: [
                'test/fixtures/css/font.css'
            ]
        });
        expect(result[0].data).to.eql(helper.readFileSync('css/out/font-limit1.css').toString());

        result = inliner.inline({
            inlineAll: true,
            // output: 'output',
            font: {
                limit: 1024 * 1.4
            },
            svg: true,
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
            ],
            svg: true
        });

        expect(result[0].data).to.eql(
            helper.readFileSync('css/out/svg.css').toString()
        );
    });

});
