inline-resource
========

[![Build Status](https://travis-ci.org/wuhy/inline-resource.svg?branch=master)](https://travis-ci.org/wuhy/inline-resource) [![Dependency Status](https://david-dm.org/wuhy/inline-resource.svg)](https://david-dm.org/wuhy/inline-resource) [![devDependency Status](https://david-dm.org/wuhy/inline-resource/dev-status.svg)](https://david-dm.org/wuhy/inline-resource#info=devDependencies) [![NPM Version](https://img.shields.io/npm/v/inline-resource.svg?style=flat)](https://npmjs.org/package/inline-resource)

> A node utility to inline everything you want to inline, including image, css, html, etc.

## Features

* Support inline `image` referred by `img` html element or css `url` using `base64` data-uri

* Support inline `svg` files referred by css or html using svg source file or `base64` data-uri
 
* Support inline `font` files using `base64` data-uri

* Support inline `css` file referred by `link` element or `@import` rule

* Support inline `html` file referred by `link` element

* Support inline `js` file referred by `script` element or `document.write` statement

* Support custom inline method using `__inline(path)` in script

* The script and style element content defined in html can also be processed

* The inline is processed recursively and support inline all local assets into a single file or specify which asset need to been processed inline
 
* The inline file support compress option

* You can custom your inline processor or inline task if existed cannot satisfy

## How to use

### Install

```shell
npm install inline-resource --save
```

### A simple example

```javascript
var inliner = require('inline-resource');
var result = inliner.inline({
    inlineAll: true,
    files: ['index.html'],
    svg: {
        useSource: true
    }
});
```

### Using with web server

* [edp webserver](https://github.com/ecomfe/edp-webserver)

    ```javascript
    {
        location: /\.js($|\?)/,
        handler: [
            file(),
            function (context) {
                var req = context.request;
                var path = req.pathname.replace(/^\/+/, '');
                var result = inliner.inline({
                    files: [{path: path, data: context.content}],
                    inlinePathGetter: function (path) {
                        return {path: path.replace(/\{\$course_host\}\//, ''), dir: '.'};
                    }
                });
                context.content = result[0].data;
            }
        ]
    },
    {
        location: /\.php/,
        handler: [
            php('php-cgi'),
            function (context) {
                var req = context.request;
                var path = req.pathname.replace(/^\/+/, '');
                var result = inliner.inline({
                    files: [{path: path, data: context.content}],
                    processor: {php: 'html'},
                    img: false,
                    css: false,
                    html: false,
                    inlinePathGetter: function (path) {
                        var url = require('url').parse(path, true);
                        var newPath = url.pathname.replace(/^\/+/, '') + url.search;
                        return {path: newPath, dir: '.'};
                    }
                });
                context.content = result[0].data;
            }
        ]
    },
    ```
    
## Options

* root - `string` `optional` the root directory to process, by defautl using current working directory

* output - `string` `optional` the output directory, by default, none will output

* files - `Array` the file to been processed inline, the file pattern using [minimatch](https://github.com/isaacs/minimatch), the regexp or file object is supported, the file object structure: `{data: string, path: string}`, the `path` is relative to `root`

* fileMap - `Object` `optional` the all read-ahead file collection, the key is `path` relative to `root`, the value is file data

* processor - `Object` `optional` custom the processor type using, e.g., {mustache: 'html'}

* inlinePathGetter - `Function` `optional` custom the inline file path

    ```javascript
    inlinePathGetter: function (path, file) {
        var path = path.replace(/{%site_host%}\//, '');
        
        return path;
        // var dir;
        // if (/\W+views\//.test(file.path)) {
        //     dir = 'example';
        // }
        // you can specify the directory that the path relative to
        // return {path: path, dir: dir};
    }
    ```

* inlineAll - `boolean` `optional` whether inline all local resources referred by the processed file, by default `false`, specify which resource need to be inline manually

* inlineParamName - `string` `optional` by default `_inline`, specify the inline resource like:

    ```
    <img src="a/b.jpg?_inline">
    
    <!-- the value of the inline param can used to specify the relative directory of the inline path --> 
    <img src="a/b.jpg?_inline=example">
    ```
 
* ignoreCompressFiles - `Array<string|RegExp>` `optional` the files to been ignored when enable compress option

* img - `boolean` `optional` whether enable image inline process using base64 encode, by default `true`

* font - `boolean` `optional` whether enable font inline process using base64 encode, by default `true`

* svg - `boolean|Object` `optional` whether enable svg inline process using base64 encode or svg source, by default `true`

    ```javascript
    svg: {
        // by default, using base64 encode
        useSource: false, 
        
        // whether compress svg source file when inline svg source, by default false
        // if enabled, please make sure `svgo@^0.6.1` is installed in global or working dir
        compress: false 
    }
    ```

* css - `boolean|Object` `optional`  whether enable css inline process, by default `true`

    ```javascript
    css: {
        // whether rebase the file path referred by inline css file, by default false
        rebase: false, 
        
        // whether compress css source file, by default false
        // if enabled, please make sure `clean-css@^3.4.9` is installed in global or working dir
        compress: false 
    }
    ```
* js - `boolean|Object` `optional`  whether enable js inline process, by default `true`

    ```javascript
    js: {
        // whether using the custom inline method, by default true
        // e.g., var tpl = '__inline("./a.tpl")'; // output: var tpl = '<inline tpl content>'
        // '__inline("./a.js")' // output: <inline js file content>
        custom: false, 
        
        // whether compress js source file, by default false
        // if enabled, please make sure `uglify-js@^2.6.1` is installed in global or working dir
        compress: false 
    }
    ```
* html - `boolean|Object` `optional`  whether enable html inline process, by default `true`

    ```javascript
    html: {
        // whether compress html source file, by default false
        compress: false 
    }
    ```  
    
## API

* addInlineTaskFor(type, tasks) - add custom inline task for the specified processor type

```javascript
var inliner = require('inline-resource');
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
```

* registerInlineProcessor(type, processor) - register inline processor for custom file type

```javascript
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
    // if support compress option, implement it
    compress: function (file, compressOption) {
        return file.data;
    }
});

```

## Limitations

The implementation to find inline assets uses regular expression heavily, so you donot expect this tool can process all cases including unconventional writing or other complex cases.
