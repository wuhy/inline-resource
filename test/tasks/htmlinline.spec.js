var expect = require('expect.js');
var helper = require('./helper');
var inliner = require('../../index');

describe('html inliner', function () {
    it('should inline script file', function () {
        var result = inliner.inline({
            inlineAll: true,
            files: [
                'test/fixtures/html/script.html'
            ],
            js: true
        });

        expect(result[0].data == helper.readFileSync('html/out/script.html').toString()).to.be(true);
    });

    it('should inline and compress script file', function () {
        var result = inliner.inline({
            inlineAll: true,
            files: [
                'test/fixtures/html/script.html'
            ],
            js: {
                compress: {
                    mangle: false
                }
            }
        });

        expect(result[0].data).to.eql(helper.readFileSync('html/out/script.compress.html').toString());
    });

    it('should process script file inline in script content element', function () {
        var result = inliner.inline({
            inlineAll: true,
            files: [
                'test/fixtures/html/script.content.html'
            ],
            js: true
        });

        expect(result[0].data).to.eql(helper.readFileSync('html/out/script.content.html').toString());
    });

    it('should inline and compress script file referred in script content element', function () {
        var result = inliner.inline({
            inlineAll: true,
            files: [
                'test/fixtures/html/script.content.html'
            ],
            js: {
                compress: true
            }
        });

        expect(result[0].data == helper.readFileSync('html/out/script.content.compress.html').toString()).to.be(true);
    });

    it('should inline css file referred in link element', function () {
        var result = inliner.inline({
            inlineAll: true,
            files: [
                'test/fixtures/html/style.html'
            ],
            css: true
        });

        expect(result[0].data == helper.readFileSync('html/out/style.html').toString()).to.be(true);
    });

    it('should inline and compress css file referred in link element', function () {
        var result = inliner.inline({
            inlineAll: true,
            files: [
                'test/fixtures/html/style.html'
            ],
            css: {
                compress: true
            }
        });

        expect(result[0].data == helper.readFileSync('html/out/style.compress.html').toString()).to.be(true);
    });

    it('should inline css with media query in link element', function () {
        var result = inliner.inline({
            inlineAll: true,
            files: [
                'test/fixtures/html/style.media.html'
            ],
            css: true
        });

        expect(result[0].data == helper.readFileSync('html/out/style.media.html').toString()).to.be(true);
    });


    it('should process css inline in style content', function () {
        var result = inliner.inline({
            inlineAll: true,
            files: [
                'test/fixtures/html/style.content.html'
            ],
            css: true
        });

        expect(result[0].data == helper.readFileSync('html/out/style.content.html').toString()).to.be(true);
    });

    it('should inline and compress style file referred in style content element', function () {
        var result = inliner.inline({
            inlineAll: true,
            files: [
                'test/fixtures/html/style.content.html'
            ],
            css: {
                compress: true
            }
        });

        expect(result[0].data == helper.readFileSync('html/out/style.content.compress.html').toString()).to.be(true);
    });


    it('should inline image file in image element', function () {
        var result = inliner.inline({
            inlineAll: true,
            files: [
                'test/fixtures/html/img.html'
            ],
            img: true
        });

        expect(result[0].data).to.eql(helper.readFileSync('html/out/img.html').toString());
    });

    it('should inline limit image file', function () {
        var result = inliner.inline({
            inlineAll: true,
            img: {
                limit: 100
            },
            files: [
                'test/fixtures/html/img.html'
            ]
        });

        expect(result[0].data).to.eql(helper.readFileSync('html/out/img-limit.html').toString());
    });

    it('should inline svg file with base64 encoding', function () {
        var result = inliner.inline({
            inlineAll: true,
            files: [
                'test/fixtures/html/svg.html'
            ],
            svg: true,
            img: true
        });

        expect(result[0].data == helper.readFileSync('html/out/svg.html').toString()).to.be(true);
    });

    it('should inline svg file using source', function () {
        var result = inliner.inline({
            inlineAll: true,
            files: [
                'test/fixtures/html/svg.html'
            ],
            svg: {
                useSource: true
            },
            img: true
        });

        expect(result[0].data).to.eql(helper.readFileSync('html/out/svg.source.html').toString());

        var result = inliner.inline({
            inlineAll: true,
            files: [
                'test/fixtures/html/svg.embed.html'
            ],
            svg: {
                useSource: true
            }
        });

        expect(result[0].data).to.eql(helper.readFileSync('html/out/svg.embed.html').toString());
    });

    it('should inline limit svg file using source', function () {
        var result = inliner.inline({
            inlineAll: true,
            files: [
                'test/fixtures/html/svg.html'
            ],
            svg: {
                useSource: true,
                limit: 100
            },
            img: true
        });

        expect(result[0].data).to.eql(helper.readFileSync('html/out/svg-limit.html').toString());
    });

    it('should inline and compress svg file using source', function () {
        var result = inliner.inline({
            inlineAll: true,
            files: [
                'test/fixtures/html/svg.html'
            ],
            svg: {
                useSource: true,
                compress: true
            },
            img: true
        });

        expect(result[0].data).to.eql(helper.readFileSync('html/out/svg.source.compress.html').toString());
    });

    it('should inline imported html file', function () {
        var result = inliner.inline({
            inlineAll: true,
            files: [
                'test/fixtures/html/importhtml.html'
            ],
            html: true,
            css: true
        });

        expect(result[0].data == helper.readFileSync('html/out/importhtml.html').toString()).to.be(true);
    });


    it('should inline and compress imported html file', function () {
        var result = inliner.inline({
            inlineAll: true,
            files: [
                'test/fixtures/html/importhtml.html'
            ],
            html: {
                compress: true
            },
            css: true
        });

        expect(result[0].data == helper.readFileSync('html/out/importhtml.compress.html').toString()).to.be(true);
    });

});
