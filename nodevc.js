var express = require('express');
var Router = require('./router').Router;

function NodeVC() {
    this.utils = require('./utils');
    this.controller = require('./controller');
    this.router = new Router(app);    
}

NodeVC.prototype.init = function(app) {
    console.log('Initialing nodevc framework...');
    this.controller.init();
    this.router.init();
};

exports.init = function (app) {
    if (arguments.length == 2) {
        app = arguments[1];
    }

    console.log('Initialing the app...');

    global.app = app;
    app.root = process.cwd();

    global.nodevc = new NodeVC();
    global.nodevc.init(app);
};