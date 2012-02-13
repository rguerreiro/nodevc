var express = require('express');
var nodevc = require('./nodevc');

var app = module.exports = express.createServer();

nodevc.init(app);

app.set('view engine', 'ejs');
app.set('view options', {
    open: '{{',
    close: '}}'
});
app.listen(process.env.PORT);

console.log("Express server listening on port %d in %s mode", process.env.PORT, app.settings.env);