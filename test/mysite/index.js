var express = require('express');
var nunjucks = require('../../');
var app1 = require('./app1');
var app2 = require('./app2');


var app = express();

app.set('view engine', 'html');
app.set('views', __dirname + '/templates');

nunjucks.setup({
    autoescape: true,
    watch: true
}, app);

app.get('/', function(req, res) {
    res.render('page');
});

app.use('/app1', app1);
app.use('/app2', app2);

app.use(function (err, req, res, next) {
    if (err) {
        res.status(500).send(['500 Internal Server Error', err.message, err.stack].join('<br>'));
    } else {
        next(err);
    }
});

app.use(function(req, res) {
    res.status(404).send('404 Not Found');
});

module.exports = app;
