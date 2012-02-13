var express = require('express');

function NodeVC() {
    global.nodevc = this;

    this.utils = require('./utils');
    this.controller  = require('./controller');
    this.routes = require('./routes');
}

exports.init = function (app) {
    if (arguments.length == 2) {
        app = arguments[1];
    }

    global.app = app;
    app.root = process.cwd();

    new NodeVC();

    nodevc.controller.init();
    nodevc.routes.init(app);
};