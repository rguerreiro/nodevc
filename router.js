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
            var isDefault = actions[action].isDefault;

            if(isRoot && isDefault) this.mapper['get'].call(this.mapper, '/', controller + '#' + action);

            console.log('Mapping path %s [%s]', path, methods);
            for (var method in methods){
                if(isDefault) this.mapper[methods[method]].call(this.mapper, basePath, controller + '#' + action);
                this.mapper[methods[method]].call(this.mapper, path, controller + '#' + action);
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
    var result = routes(this);
    
    console.log('Available routes:');
    for(var path in this.mapper.pathTo) {
        console.log('\t%s', this.mapper.pathTo[path].toString());
    }
    return result;
};

Router.prototype.init = function() {
    console.log('Initializing router');
    if (path.existsSync(app.root + '/routes.js')) {
        this.addRoutes(app.root + '/routes');
    }
};

exports.Router = Router;