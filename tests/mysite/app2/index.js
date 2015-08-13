var express = require('express');
var nunjucks = require('../../../');


var app = express();
app.set('views', __dirname + '/templates');

nunjucks.useApp(app);

app.get('/', function(req, res) {
    res.render('app2/page', {title: 'Welcome to app2!'});
});

module.exports = app;
