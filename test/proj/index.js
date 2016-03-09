var express = require('express');
var nunjucks = require('../../');
var app = require('./app');


var rootApp = express();

rootApp.set('view engine', 'html');
rootApp.set('views', __dirname + '/templates');

nunjucks.setup({
    autoescape: true,
    watch: true
}, rootApp);

rootApp.get('/', function(req, res) {
    res.render('index');
});

rootApp.use('/app', app);

rootApp.use(function (err, req, res, next) {
    if (err) {
        console.error(err.stack);
        res.status(500).send(['500 Internal Server Error', err.stack].join('<br>'));
    } else {
        next(err);
    }
});

rootApp.use(function(req, res) {
    res.status(404).send('404 Not Found');
});

module.exports = rootApp;
