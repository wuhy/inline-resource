var expect = require('expect.js');
var helper = require('./helper');
var util = require('../../lib/processor/helper');

describe('css regex constant', function () {
    it('should extract css url info', function () {
        var regex = util.CSS_URL_REGEXP;
        var getMatchItem = function (str) {
            var result;
            var matchItems = [];
            while (result = regex.exec(str)) {
                matchItems.push(result[1]);
            }
            return matchItems;
        };
        var result = getMatchItem('url("a/b.png")');
        expect(result.length).to.eql(1);
        expect(result).to.eql(['a/b.png']);

        result = getMatchItem('background: url("a/b.png"); \r\n background: url( c/d.png?23#sd )')
        expect(result.length).to.eql(2);
        expect(result).to.eql(['a/b.png', 'c/d.png?23#sd ']);

        result = getMatchItem(helper.readFileSync('extract/url.css').toString());
        expect(result).to.eql([
            '../fonts/icomoon.eot?-c0lvak',
            '../fonts/icomoon.eot?#iefix-c0lvak',
            '../fonts/icomoon.ttf?-c0lvak ',
            '../fonts/icomoon.woff?-c0lvak',
            '../fonts/icomoon.svg?-c0lvak#icomoon',
            './import/icon2.png',
            'https://mdn.mozillademos.org/files/11991/startransparent.gif',
            'https://mdn.mozillademos.org/files/7693/catfront.png',
            'border.png',
            'border.png',
            'border.png',
            '{% host %}/a/b.png'
        ]);
    });

    it('shoudl extract import url info', function () {
        var regex = util.CSS_IMPORT_REGEXP;
        var getMatchItem = function (str) {
            var result;
            var matchItems = [];
            while (result = regex.exec(str)) {
                matchItems.push(result[1]);
            }
            return matchItems;
        };
        var result = getMatchItem(helper.readFileSync('extract/import.css').toString());
        expect(result).to.eql([
            '{% host %}/a/b/import.css',
            'import/import.css',
            'import/import.css',
            'import/import2.css',
            'import/import3.css',
            'import/import4.css',
            'import/import5.css',
            'import/import6.css',
            'import/import7.css'
        ]);
    });
});

describe('html regexp constant', function () {
    it('should extract link info', function () {
        var regex = util.LINK_REGEXP;
        var getMatchItem = function (str) {
            var result;
            var matchItems = [];
            while (result = regex.exec(str)) {
                if (!result[1]) {
                    matchItems.push(result[0]);
                }
            }
            return matchItems;
        };
        var result = getMatchItem(helper.readFileSync('extract/1.html').toString());
        expect(result).to.eql([
            '<link href="" rel="shortcut icon" />',
            '<link href="dep/normalize/2.1.0/normalize.css" rel="stylesheet" />',
            '<link rel="stylesheet" type="text/css" href="theme.css">',
            '<link href="src/common/css/main.less" rel="stylesheet" />',
            '<link rel="import" href="/path/to/imports/stuff.html">'
        ]);
    });

    it('should extract style info', function () {
        var regex = util.STYLE_REGEXP;
        var getMatchItem = function (str) {
            var result;
            var matchItems = [];
            while (result = regex.exec(str)) {
                matchItems.push({
                    attrs: result[1],
                    content: result[2],
                    end: result[3]
                });
            }
            return matchItems;
        };
        var result = getMatchItem(helper.readFileSync('extract/1.html').toString());
        expect(result).to.eql([
            {
                attrs: '<style>',
                content: 'body{width: 100%;}',
                end: '</style>'
            },
            {
                attrs: '<style >',
                content: '\n    ',
                end: '</style>'
            },
            {
                attrs: '<style>',
                content: '\n        @import \'import.css\' all;\n        .icon {\n            width: 100%;\n        }\n    ',
                end: '</style>'
            },
            {
                attrs: '<style type="text/css">',
                content: '\n        h1 {color:red;}\n        p {color:blue;}\n    ',
                end: '</style>'
            },
            {
                attrs: '<style>',
                content: '\n        @media (max-width: 600px) {\n            .facet_sidebar {\n                display: none;\n            }\n        }\n    ',
                end: '</style>'
            },
            {
                attrs: '<style media="print">',
                content: '\n        h1 {color:#000000;}\n        p {color:#000000;}\n        body {background-color:#FFFFFF;}\n    ',
                end: '</style>'
            },
            {
                attrs: '<style scoped>',
                content: '\n        h1 {color:red;}\n        p {color:blue;}\n    ',
                end: '</style>'
            }
        ]);
    });

    it('should extract image info', function () {
        var regex = util.IMG_REGEXP;
        var getMatchItem = function (str) {
            var result;
            var matchItems = [];
            while (result = regex.exec(str)) {
                matchItems.push({
                    start: result[1],
                    attr: result[2]
                });
            }
            return matchItems;
        };
        var result = getMatchItem(helper.readFileSync('extract/1.html').toString());
        expect(result).to.eql([
            {
                start: '<img',
                attr: ' src="../img/bookmark.png" alt="bookmark"'
            },
            {
                start: '<img',
                attr: ' title="bookmark" src= "{% host %}/img/bookmark.png"'
            },
            {
                start: '<img',
                attr: ' src="a/b.png?a=33"'
            }
        ]);
    });

    it('should extract object info', function () {
        var regex = util.OBJECT_REGEXP;
        var getMatchItem = function (str) {
            var result;
            var matchItems = [];
            while (result = regex.exec(str)) {
                matchItems.push({
                    start: result[1],
                    end: result[2]
                });
            }
            return matchItems;
        };
        var result = getMatchItem(helper.readFileSync('extract/1.html').toString());
        expect(result).to.eql([
            {
                start: '<object width="400" height="400" data="helloworld.swf">',
                end: '</object>'
            },
            {start: '<object>', end: '</object>'},
            {
                start: '<object data="helloworld.swf" type="application/vnd.adobe.flash-movie">',
                end: '\n\n</object>'
            }
        ]);
    });

    it('should extract script info', function () {
        var regex = util.SCRIPT_REGEXP;
        var getMatchItem = function (str) {
            var result;
            var matchItems = [];
            while (result = regex.exec(str)) {
                if (!result[1]) {
                    matchItems.push({
                        start: result[2],
                        attr: result[3],
                        content: result[4],
                        end: result[5]
                    });
                }
            }
            return matchItems;
        };
        var result = getMatchItem(helper.readFileSync('extract/2.html').toString());
        expect(result).to.eql([
            {
                start: '<script',
                attr: ' src="http://s1.bdstatic.com/r/www/cache/static/jquery/jquery-1.10.2.min_f2fb5194.js">',
                content: '',
                end: '</script>\n'
            },
            {
                start: '<script',
                attr: '>',
                content: '\n    require.config({\n\n        baseUrl: \'src\',\n\n        packages: [\n\n        ],\n        paths: {\n\n        }\n    });\n',
                end: '</script>\n'
            },
            {
                start: '<script',
                attr: ' src="a.js">',
                content: '',
                end: '</script>\n\n'
            },
            {
                start: '<script',
                attr: '>',
                content: '\n    var c = 3;\n    document.write(\'<script src="c.js"><\\\/script>\');\n',
                end: '</script>\n'
            },
            {start: '<script', attr: '>', content: '', end: '</script>\n'}
        ]);
    });
});

describe('js regexp constant', function () {
    it('should extract document.write info', function () {
        var regex = util.DOCUMENT_WRITE_REGEXP;
        var getMatchItem = function (str) {
            var result;
            var matchItems = [];
            while (result = regex.exec(str)) {
                if (!result[1]) {
                    matchItems.push(result[2]);
                }
            }
            return matchItems;
        };
        var result = getMatchItem(helper.readFileSync('extract/1.js').toString());
        expect(result).to.eql([
            'a/b.js', '//d/e.js', 'f.js', 'http://xxx.baiu.com/sd.js'
        ]);
    });

    it('should extract custom inline info', function () {
        var regex = util.CUSTOM_INLINE_REGEXP;
        var getMatchItem = function (str) {
            var result;
            var matchItems = [];
            while (result = regex.exec(str)) {
                matchItems.push({
                    prefix: result[1],
                    quot: result[2],
                    url: result[3]
                });
            }
            return matchItems;
        };
        var result = getMatchItem(helper.readFileSync('extract/1.js').toString());
        expect(result).to.eql([
            {prefix: ' = ', quot: '\\\'', url: './inline.tpl'},
            {prefix: ' = ', quot: '"', url: './inline.css'},
            {prefix: ' = ', quot: '\\"', url: '../img/bookmark.png'},
            {prefix: undefined, quot: '"', url: './inline.js'}
        ]);
    });
});


describe('helper', function () {
    it('should return right attr regexp', function () {
        var regexp = util.getAttrRegexp('href');
        var href = regexp.exec('<link href="a/b.css" rel="stylesheet">');
        expect(href[2]).to.eql('a/b.css');

        href = regexp.exec('<link href= "a/b.css" rel="stylesheet">');
        expect(href[2]).to.eql('a/b.css');

        href = regexp.exec('<link href= \'a/b.css\' rel="stylesheet">');
        expect(href[2]).to.eql('a/b.css');
    });

    it('should has attribute value', function () {
        expect(util.hasAttrValue('src="a.js"', 'src', 'a.js')).to.eql(true);
        expect(util.hasAttrValue('src= "b.js"', 'src', 'a.js')).to.eql(false);
        expect(util.hasAttrValue('src= \'b.js\' ', 'src', 'b.js')).to.eql(true);
    });

    it('should to datauri', function () {
        expect(util.toDataURI('img/bookmark.png', helper.readFileSync('img/bookmark.png'))).to.eql('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACDElEQVR4nLVSPWhTURg9992bF5M0kiGUUh2KpkoFUWs6qINDIw46dvMvWlALVUEnuwlKhyA6iNpF8XdRoUMXcSgOsSKxghmtOmloTO3PS9/Lu/fd+zmIJWlMwcG7ne+c73DPuRf4n+fQxPzpwxOVk2tpxFok935eITIawP1WGqsVkRkvH4wY2RGlYMOBF6XMPxvw5fmco8hxFDnMW8y10rF6sP9ZKQmilKwu7G23g+tz0rpMAJK2Gf0h+QURT7xjjH96PdAxt2Kw5+HMvrCRLwV0zCLzuxRm4BkBadmcYBA2gY6wAICFAIBhFgLwZR+hjDV1PJX3NF21tIIvNb67KjvrsZ4lp2rns1vNm2yPWaxW7VmfbSu56oQvNSyt4Cl9bSrb/XYlQnqsOBRH7banqOyLcOrD2R1Ofbxdd4sRW3szUcE6l0zo3PuhnbcaSiyc2X5nTvEjHKadG/m5qW2tvgoynRUfg3+Wm17h43DvU1ebivblt9UGRtbKrtKl4vm+e/Xzho/UncsLpnXSVcGDzaOTuyO2eM4A1FQw4Er/VUTwi003a0B2NE1aA0SD8RArQAddpIOumGAFRnSKjMGWm9O9LQ0CJdMGBA4kHIlHHo/GPBFrq0r2hAMJgKCV39cyAjO631E0iXXrj325lK7v4eimG9Mj8BYeQ5h+AGOrowAANo6Mx/9KNGra6vEvz6L1ybL0deIAAAAASUVORK5CYII=');
    });

    it('should convert text to emebdded js content', function () {
        // var fs = require('fs');
        // fs.writeFileSync('test/fixtures/format.js', util.text2JS('var a = 3; \nconsole.log(a);'));
        expect(util.text2JS('var a = 3; \nconsole.log(a);')).to.eql(
            helper.readFileSync('format.js').toString()
        );
    });
});
