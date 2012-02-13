var utils = require('./utils');
var fs = require('fs');
var path = require('path');
var layoutsCache = {};

function Controller(name) {
    if (!layoutsCache[name]) {
        layoutsCache[name] = path.existsSync(app.root + '/views/' + name + '/' + name + '_layout') ? name : null;
    }

    // private properties
    var actions = {};
    var useMasterLayout = true;
    var layout = layoutsCache[name];

	// public properties
	this.controllerName = name;
    this.controllerFile = Controller.index[name];

    if (!this.controllerFile) {
        throw new Error('Controller ' + name + ' is not defined');
    }

    this.__dirname = app.root;

	// methods 
    // support for both get and post
	this.action = function(name, methods, action){
        if(typeof methods === 'function') {
            action = methods;
            methods = ['get', 'post'];
        }
		
        if (!name) throw new Error('Named function required when `name` param omitted');

        action.isAction = true;
        action.customName = name;
        action.methods = methods;
        actions[name] = action;
	};

    this.execute = function (actionName, req, res) {
        res.info = {
            controller: this.controllerName,
            action: actionName,
            startTime: Date.now()
        };
        res.actionHistory = [];
        if (!this.initialized) {
            this.init();
            this.initialized = true;
        }        

        var ctl = this, timeStart = false, prevMethod;

        this.ctx = {
            req: req,
            res: res,
            next: next,
            action: actionName,
            //paths: Controller.getPathTo(actionName, req, res)
        };

        req.sandbox = {};

        if (req.body && req.method !== 'GET') {
            var filteredBody = {};
            Object.keys(req.body).forEach(function (param) {
                if (!filterParams.some(function (filter) {return param.search(filter) !== -1;})) {
                    filteredBody[param] = req.body[param];
                } else {
                    filteredBody[param] = '[FILTERED]';
                }
            });
        }

        var queue = [];

        //enqueue(beforeFilters, queue);
        queue.push(getCaller(actions[actionName]));
        //enqueue(afterFilters, queue);

        next();

        function next() {
            if (timeStart && prevMethod) {
                res.actionHistory.push({name: prevMethod.customName, time: Date.now() - timeStart});
            }

            // run next method in queue (if any callable method)
            var method = queue.shift();
            if (typeof method == 'function') {
                process.nextTick(function () {
                    method.call(ctl.request.sandbox, next);
                });
            } else {
                res.info.appTime = Date.now() - res.info.startTime;
            }
        }

        function getCaller(method) {
            if (!method) {
                throw new Error('Undefined action');
            }

            return function (next) {
                req.inAction = method.isAction;
                timeStart = Date.now();
                prevMethod = method;
                method.call(this, next);
            }
        }

        function enqueue(collection, queue) {
            collection.forEach(function (f) {
                var params = f[1];
                if (!params) {
                    enqueue();
                } else if (params.only && params.only.indexOf(actionName) !== -1 && (!params.except || params.except.indexOf(actionName) === -1)) {
                    enqueue();
                } else if (params.except && params.except.indexOf(actionName) === -1) {
                    enqueue();
                }
                function enqueue() { queue.push(getCaller(f[0])); }
            });
        }
    };
    this.load = function (controller) {
        utils.runCode(Controller.index[controller], this);
    }.bind(this);
    this.init = function () {
        // reset scope variables
        actions = {};
        layout = null;

        Object.keys(Controller.prototype).forEach(function (method) {
            this[method] = Controller.prototype[method];
        }.bind(this));

        utils.runCode(this.controllerFile, this);
    };
    this.nomaster = function() {
        useMasterLayout = false;
    };
    this.layout = function (l) {
        if (typeof l !== 'undefined') {
            layout = l;
        }
        return layout ? layout + '/' + layout + '_layout' : (useMasterLayout ? 'master' : null);
    };

    this.__defineGetter__('response',  function () { return this.ctx.res }.bind(this));
    this.__defineGetter__('res',       function () { return this.ctx.res }.bind(this));
    this.__defineGetter__('request',   function () { return this.ctx.req }.bind(this));
    this.__defineGetter__('req',       function () { return this.ctx.req }.bind(this));
    this.__defineGetter__('session',   function () { return this.ctx.req.session }.bind(this));
    this.__defineGetter__('params',    function () { return this.ctx.req.params }.bind(this));
    this.__defineGetter__('body',      function () { return this.ctx.req.body }.bind(this));
    this.__defineGetter__('next',      function () { return this.ctx.next }.bind(this));
    this.__defineGetter__('actionName',function () { return this.ctx.action }.bind(this));
    this.__defineGetter__('path_to',   function () { return this.ctx.paths }.bind(this));
}

Controller.prototype.view = function (arg1, arg2) {
    var viewName, params;
    if (typeof arg1 == 'string') {
        viewName = arg1;
        params = arg2;
    } else {
        viewName = this.actionName;
        params = arg1;
    }
    params = params || {};
    params.controllerName = params.controllerName || this.controllerName;
    params.actionName = params.actionName || this.actionName;
    params.path_to = this.path_to;
    params.request = this.request;

    var layout = params.nomaster ? null : this.layout();
    var file = this.controllerName + '/' + viewName;

    console.log("rendering the view " + file);

    this.response.renderCalled = true;
    this.response.render(file, {
        locals: utils.safe_merge(params, this.request.sandbox),
        layout: layout ? layout : false,
        debug:  false
    });
    if (this.request.inAction) this.next();
};

exports.Controller = Controller;
exports.addBasePath = function (basePath, prefix, context) {
    prefix = prefix || '';
    if (path.existsSync(basePath)) {
        fs.readdirSync(basePath).forEach(function (file) {
            var stat = fs.statSync(path.join(basePath, file));
            if (stat.isFile()) {
                var m = file.match(/(.*?)_controller\.js$/);
                if (m) {
                    var ctl = prefix + m[1];
                    Controller.index[ctl] = Controller.index[ctl] || path.join(basePath, file);
                    Controller.context[ctl] = Controller.context[ctl] || context;
                }
            } else if (stat.isDirectory()) {
                exports.addBasePath(path.join(basePath, file), prefix + file + '/');
            }
        });
    }
};
exports.init = function () {
    Controller.index = {};
    Controller.context = {};
    exports.addBasePath(app.root + '/controllers');
};
exports.load = function (name) {
    return new Controller(name);
};