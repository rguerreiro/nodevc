var routing = require('railway-routes');
var path = require('path');

function Router(app) {
    this.app = app;
    this.mapper = new routing.Map(app, this.handler);
}

Router.prototype.handler = function (ns, controller, action) {
    return function (req, res) {
        console.log('Handling request for %s#%s', controller, action);
        var ctl = nodevc.controller.load(ns + (controller || req.params.controller));
        ctl.execute(action || req.params.action, req, res);
    };
}

Router.prototype.map = function (ns, controller, isRoot) {
    if (typeof controller === 'undefined') {
        controller = ns;
        ns = '';
        isRoot = false;
    }
    if(typeof controller === 'boolean') {
        isRoot = controller;
        controller = ns;
        ns = '';
    }

    console.log('Mapping controller %s', controller);

    var actions = getActions(ns, controller);

    for (var action in actions){
       (function (action){
            var basePath = '/' + ns + controller;
            var path = basePath + '/' + action;
            var methods = actions[action].methods;
            var isDefault = actions[action].default;
            var hndlr = controller + '#' + action;

            if(isRoot && isDefault) {
                console.log('Mapping root ==> %s', hndlr);
                this.mapper['get'].call(this.mapper, '/', hndlr); 
            }

            for (var method in methods){
                if(isDefault) {
                    console.log('Mapping [%s] %s ==> %s', methods[method], basePath, hndlr);
                    this.mapper[methods[method]].call(this.mapper, basePath, hndlr);
                }
                console.log('Mapping [%s] %s ==> %s', methods[method], path, hndlr);
                this.mapper[methods[method]].call(this.mapper, path, hndlr);
            }
       }.bind(this))(action);
    }

    function getActions(ns, controller) {
        var ctl = nodevc.controller.load(ns + controller);
        return ctl.availableActions();
    }
};

Router.prototype.addRoutes = function(path){
    var routes = require(path);
    routes = routes.routes || routes;
    if (typeof routes !== 'function') {
        throw new Error('Routes is not defined in ' + path);
    }
    console.log('Executing the routes definition from %s', path);
    return routes(this.mapper);
};

Router.prototype.init = function() {
    console.log('Initializing router');

    if (path.existsSync(app.root + '/routes.js')) {
        this.addRoutes(app.root + '/routes');
    }

    var controllers = nodevc.controller.get();
    for(var ctl in controllers) {
        this.map(ctl, ctl === 'home');
    }

    console.log('Available routes:');
    for(var p in this.mapper.pathTo) {
        console.log('\t%s', this.mapper.pathTo[p].toString());
    }
};

exports.Router = Router;