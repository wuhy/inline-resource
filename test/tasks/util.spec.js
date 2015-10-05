var expect = require('expect.js');
var util = require('../../lib/util');
var pathUtil = require('path');
var fs = require('fs');

describe('utility', function () {
    it('should match given pattern', function () {
        expect(util.isMatch('a/b.js', [])).to.be(false);
        expect(util.isMatch('a/b.js', ['a/*.js'])).to.be(true);
        expect(util.isMatch('a/b.js', ['a/b/*.js'])).to.be(false);
        expect(util.isMatch('a/b.js', ['a/b/*.js', 'a/*.js'])).to.be(true);
    });

    it('should return expected item', function () {
        expect(util.findItem('name', 'abc', [])).to.be(undefined);
        expect(util.findItem('a', 0, [{a: '0'}])).to.be(undefined);
        expect(util.findItem('a', 0, [{a: 0}])).to.eql({a: 0});
        expect(util.findItem('a', 1, [{a: 1, b: 2}, {a: 1, b: -1}])).to.eql({a: 1, b: 2});
        expect(util.findItem('a', '1', [{b: 1}, {}])).to.be(undefined);
    });

    it('should normalize the given path', function () {
        expect(util.normalizePath('./a/b')).to.be('a/b');
        expect(util.normalizePath('\\a\\b\\')).to.be('/a/b/');
        expect(util.normalizePath('/d/c.js')).to.be('/d/c.js');
    });

    it('should inherits the given function', function () {
        function A() {}
        function B() {}
        util.inherits(B, A);
        var b = new B();
        expect(b instanceof B).to.be(true);
        expect(b instanceof A).to.be(true);
    });

    it('should return the corrent file extname', function () {
        expect(util.getFileExtName('/a/b')).to.be('');
        expect(util.getFileExtName('a/b.js')).to.be('js');
        expect(util.getFileExtName('a/b.ab.js')).to.be('js');
        expect(util.getFileExtName('a/b.JS')).to.be('JS');
    });

    it('should check the path is local correctly', function () {
        expect(util.isLocalPath('/a/b')).to.be(true);
        expect(util.isLocalPath('\\a\\b')).to.be(true);
        expect(util.isLocalPath('//a/b')).to.be(false);
        expect(util.isLocalPath('d:/a/b')).to.be(true);
        expect(util.isLocalPath('http://a/b')).to.be(false);
        expect(util.isLocalPath('https://a/b')).to.be(false);
        expect(util.isLocalPath('.')).to.be(true);
        expect(util.isLocalPath('ftp://a/b')).to.be(false);
    });

    it('should rebase the given path', function () {
        expect(util.rebasePath('./a/b.js', 'index.html', 'c/index.html')).to.be('../a/b.js');
        expect(util.rebasePath('../a.js', 'c/index.html', 'index.html')).to.be('a.js');
        expect(util.rebasePath('b.js', 'c/index.html', 'index.html')).to.be('c/b.js')
    });

    it('should traverse the given directory', function () {
        var fileArr = [];
        util.traverseFileSync('test/fixtures/a', function (path) {
            fileArr.push(pathUtil.relative(process.cwd(), path));
        });

        var target = [
            'test/fixtures/a/a.js',
            'test/fixtures/a/c/d.js',
            'test/fixtures/a/c/e.js'
        ];
        expect(fileArr.length).to.be(target.length);
        fileArr.forEach(function (item) {
            expect(target.indexOf(item) !== -1).to.be(true);
        });

        fileArr = [];
        util.traverseFileSync('test/fixtures/a/b', function (path) {
            fileArr.push(pathUtil.relative(process.cwd(), path));
        });
        expect(fileArr).to.be.eql([]);
    });

    it('should create correct directory based the given path', function () {
        var aPath = pathUtil.join(__dirname, 'a');
        var bPath = pathUtil.join(aPath, 'b.js');
        util.mkdirsSyn(aPath);
        util.mkdirsSyn(bPath);

        expect(fs.statSync(aPath).isDirectory()).to.be(true);
        expect(fs.statSync(bPath).isDirectory()).to.be(true);

        fs.rmdir(bPath, function (err) {
            if (err) {
                console.log('unlink file error:' + err);
            }
            else {
                fs.rmdir(aPath, function (err) {
                    err && console.log('unlink file error:' + err);
                });
            }
        });
    });

    it('should return the file type of the given file path', function () {
        expect(util.getFileType('a/b.html')).to.be('html');
        expect(util.getFileType('a/b.htm')).to.be('html');
        expect(util.getFileType('a/b.xhtml')).to.be('html');
        expect(util.getFileType('a/b.tpl')).to.be('html');

        expect(util.getFileType('a/b.css')).to.be('css');
        expect(util.getFileType('a/b.styl')).to.be('css');
        expect(util.getFileType('a/b.less')).to.be('css');
        expect(util.getFileType('a/b.sass')).to.be('css');
        expect(util.getFileType('a/b.scss')).to.be('css');

        expect(util.getFileType('a/b.js')).to.be('js');
        expect(util.getFileType('a/b.coffee')).to.be('js');
        expect(util.getFileType('a/b.ts')).to.be('js');
        expect(util.getFileType('a/b.dart')).to.be('js');

        expect(util.getFileType('a/b.png')).to.be('img');
        expect(util.getFileType('a/b.gif')).to.be('img');
        expect(util.getFileType('a/b.jpg')).to.be('img');
        expect(util.getFileType('a/b.jpeg')).to.be('img');
        expect(util.getFileType('a/b.bmp')).to.be('img');
        expect(util.getFileType('a/b.webp')).to.be('img');

        expect(util.getFileType('a/b.ttf')).to.be('font');
        expect(util.getFileType('a/b.otf')).to.be('font');
        expect(util.getFileType('a/b.woff')).to.be('font');
        expect(util.getFileType('a/b.eot')).to.be('font');

        expect(util.getFileType('a/b.svg')).to.be('svg');
    });
});
