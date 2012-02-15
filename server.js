var express = require('express');
var nodevc = require('./nodevc');

var app = module.exports = express.createServer();

nodevc.init(app);

app.set('view engine', 'ejs'); // must always be set
app.set('view options', {
    open: '{{',
    close: '}}'
});
app.listen(process.env.PORT);

console.log("Express server listening on port %s in %s mode [%s]", process.env.PORT, app.settings.env, (new Date()).toString());