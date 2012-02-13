var path = require('path'), vm = require('vm');

var safe_merge = exports.safe_merge = function (merge_what) {
    merge_what = merge_what || {};
    Array.prototype.slice.call(arguments).forEach(function (merge_with, i) {
        if (i == 0) return;
        for (var key in merge_with) {
            if (!merge_with.hasOwnProperty(key) || key in merge_what) continue;
            merge_what[key] = merge_with[key];
        }
    });
    return merge_what;
};

// cache for source code
var cache = {};
// cache for compiled scripts
var scriptCache = {};

function runCode(filename, context) {
    context = context || {};

    var dirname = path.dirname(filename);

    // extend context
    context.require = context.require || function (apath) {
        var isRelative = apath.match(/^\.\.?\//);
        return require(isRelative ? path.resolve(dirname, apath) : apath);
    };
    context.app = app;
    context.console = console;
    context.setTimeout = setTimeout;
    context.setInterval = setInterval;
    context.clearTimeout = clearTimeout;
    context.clearInterval = clearInterval;
    context.__filename = filename;
    context.__dirname = dirname;
    context.process = process;
    context.Buffer = Buffer;

    // omit file reading and caching part if we have compiled script
    if (!scriptCache[filename]) {
        cache[filename] = cache[filename] || filename && path.existsSync(filename) && require('fs').readFileSync(filename);
        if (!cache[filename]) {
            return;
        }
        var code = cache[filename].toString();
    }

    try {
        var m;
        if (scriptCache[filename]) {
            m = scriptCache[filename];
        } else {
            m = vm.createScript(code.toString('utf8'), filename);
            scriptCache[filename] = m;
        }
        m.runInNewContext(context);
    } catch (e) {
        console.log('Error while executing ' + filename);
        throw e;
    }

    // disable caching in development mode
    if (app.disabled('eval cache')) {
        cache[filename] = null;
        scriptCache[filename] = null;
    }
}
exports.runCode = runCode;