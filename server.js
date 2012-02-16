var express = require('express');
var nodevc = require('./nodevc');

var app = module.exports = express.createServer();

app.configure(function(){
    console.log('Configuring express');

    var cwd = process.cwd();
    
    app.use(express.static(cwd + '/public'));
    //app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.set('view options', {complexNames: true, open: '{{', close: '}}'});
    app.set('scripts directory', '/scripts/');
    app.set('css directory', '/css/');
    app.use(express.bodyParser());
    //app.use(express.cookieParser('secret'));
    //app.use(express.session({secret: 'secret'}));
    app.use(express.methodOverride());
    app.use(app.router);
});

nodevc.init(app);

app.listen(process.env.PORT);

console.log("Express server listening on port %s in %s mode [%s]", process.env.PORT, app.settings.env, (new Date()).toString());