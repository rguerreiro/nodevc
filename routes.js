var routing = require('railway-routes');

exports.init = function (app) {
    var map = new routing.Map(app, handler);

    //map.resources('posts');
    map.get('/', 'posts#index');
    map.get('/posts', 'posts#index');
    map.get('/posts/index', 'posts#index');
    map.post('/posts/index', 'posts#index');
    map.get('/posts/index2', 'posts#index2');

    // generic routes
    //map.all('/:controller/:action');
    //map.all('/:controller/:action/:id');
};

// simple routes handler
function handler(ns, controller, action) {
    /*
    try {
        var controllerFile = './controllers/' + ns + controller + "_controller";
        var responseHandler =  require(controllerFile)[action];
    } catch(e) {}

    return controller ? responseHandler || handlerNotFound : genericRouter;

    function handlerNotFound(req, res) {
        res.send('Handler not found for ' + ns + controller + '#' + action);
    };

    // to deal with :controller/:action routes
    function genericRouter(req, res) {
        var controllerFile = './controllers/' + ns + req.param('controller') + "_controller";
        try {
            var responseHandler =  require(controllerFile)[req.param('action')];
        } catch (e) {
            responseHandler = function (req, res) {
                res.send('Handler not found for ' + ns + req.param('controller') + '#' + req.param('action'));
            }
        }
        responseHandler(req, res);
    }*/
    return function (req, res) {
        var ctl = nodevc.controller.load(ns + (controller || req.params.controller));
        ctl.execute(action || req.params.action, req, res);
    };
}