var inliner = require('./../index');
inliner.addInlineTaskFor('html', function (file) {
    var me = this;
    var inlineTplRegexp = /<!--\s*inline:\s*([^\s]+)\s*-->/g;
    return file.data.replace(inlineTplRegexp, function (match, path) {
        var result = me.getInlineResult(path);
        if (result) {
            return result.data;
        }
        return match;
    });
});

var result = inliner.inline({
    inlineAll: true,
    files: [
        ///^example\/a\.html/,
        //'example/c.html',
        //'example/img.html',
        //'example/svg.html',
        //'example/importer.html',
        //'example/write.html',
        //'example/customPath.tpl',
        //'example/views/server.tpl',
        //'example/customTpl.mustache',
        //'example/d.html',
        //'example/js/customInline.js',
        //'example/icomoon/demo.html',
        'example/customTask.html'
    ],
    inlinePathGetter: function (path, file) {
        console.log(path + '; file:' + file.path)
        var path = path.replace(/{%site_host%}\//, '');
        var dir;
        if (/\W+views\//.test(file.path)) {
            dir = 'example';
        }

        return {path: path, dir: dir};
    },
    processor: {
        mustache: 'html'
    },
    ignoreCompressFiles: [
        '*.min.js'
    ],
    img: true,
    font: true,
    svg: {
        useSource: true,
        compress: true
    },
    js: {
        custom: true,
        compress: false
    },
    css: {
        rebase: true,
        compress: false
    },
    html: {
        compress: true
    },
    output: 'output'
});


