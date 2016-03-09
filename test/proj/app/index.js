var express = require('express');
var nunjucks = require('../../../');
var filters = require('./filters');
var app = express();

app.set('views', __dirname + '/templates');

nunjucks.register(app).then(function(env) {
    Object.keys(filters).forEach(function(name) {
        env.addFilter(name, filters[name]);
    });
});

app.get('/', function(req, res) {
    res.render('app/index');
});

app.get('/filter', function(req, res) {
    res.render('app/filter', {value: 'snake'});
});

app.get('/override', function(req, res) {
    res.render('app/override');
});

module.exports = app;
