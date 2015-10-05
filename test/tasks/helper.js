var fs = require('fs');
var pathUtil = require('path');

exports.readFileSync = function (path) {
    var filePath = pathUtil.join(process.cwd(), 'test/fixtures', path);
    return fs.readFileSync(filePath);
};

exports.unlinkDirectory = function (dir) {
    if (!fs.statSync(dir)) {
        return;
    }

    fs.readdirSync(dir).forEach(function (fileName) {
        var f = pathUtil.resolve(dir, fileName);
        var stat = fs.statSync(f);

        if (stat.isDirectory()) {
            exports.unlinkDirectory(f);
        }
        else {
            fs.unlinkSync(f);
        }
    });

    fs.rmdirSync(dir);
};
