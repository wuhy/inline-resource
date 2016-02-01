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
// inliner.addInlineTaskFor('js', [
//     function (file) {
//         return file.data.replace(/\{|\}/g, function (match) {
//             return {'{': '{ldelim}', '}': '{rdelim}'}[match];
//         });
//     }
// ]);
inliner.registerInlineProcessor('etpl', {
    taskList: [
        function (file) {
            var me = this;
            return file.data.replace(
                /<!--\s*include:\s*([^\s]+)\s*-->/g,
                function (match, path) {
                    var result = me.getInlineResult(path);
                    if (result) {
                        return result.data;
                    }
                    return match;
                }
            )
        }
    ],
    compress: function (file) {
        return file.data.trim();
    }
});

var result = inliner.inline({
    inlineAll: true,
    files: [
        /^example\/a\.html/,
        'example/c.html',
        'example/img.html',
        'example/svg.html',
        'example/importer.html',
        'example/write.html',
        'example/customPath.tpl',
        'example/views/server.tpl',
        'example/customTpl.mustache',
        'example/d.html',
        'example/js/customInline.js',
        'example/icomoon/demo.html',
        'example/customTask.html',
        'example/custom.etpl'
    ],
    inlinePathResolver: function (path, file) {
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
    etpl: {
        compress: true
    },
    output: 'output'
});


