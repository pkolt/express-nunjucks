var express = require('express');
var nunjucks = require('../../../');


var app = express();
app.set('views', __dirname + '/templates');

nunjucks.useApp(app, function(env) {
    env.addFilter('snake', function(text) {
        return (text || '').split('').map(function(ch, i) {
            return i % 2 === 0 ? ch.toUpperCase() : ch.toLowerCase();
        }).join('');
    });
});

app.get('/', function(req, res) {
    res.render('app1/page', {title: 'Welcome to app1!'});
});

app.get('/snake', function(req, res) {
    res.render('app1/snake', {title: 'nunjucks'});
});

module.exports = app;
