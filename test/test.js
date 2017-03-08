'use strict';

const test = require('ava');
const express = require('express');
const request = require('supertest-as-promised');
const nunjucks = require('nunjucks');
const expressNunjucks = require('../');


test('simple page', async t => {
    const app = express();
    app.set('views', __dirname + '/templates');

    const njk = expressNunjucks(app);

    app.get('/', (req, res) => {
        res.render('simple', {title: 'simple page'});
    });

    const res = await request(app)
        .get('/')
        .expect(200);

    t.regex(res.text, /simple page/);
});


test('custom filters', async t => {
    const app = express();
    app.set('views', __dirname + '/templates');

    const filters = {
        snake: function(text) {
            return (text || '').split('').map(function(ch, i) {
                return i % 2 === 0 ? ch.toUpperCase() : ch.toLowerCase();
            }).join('');
        }
    };

    const njk = expressNunjucks(app, {
        filters: filters
    });

    app.get('/', (req, res) => {
        res.render('filters', {title: 'snake'});
    });

    const res = await request(app)
        .get('/')
        .expect(200);

    t.regex(res.text, /SnAkE/);
});

test('custom globals', async t => {
    const app = express();
    app.set('views', __dirname + '/templates');

    const globals = {
        snake: function(text) {
            return (text || '').split('').map(function(ch, i) {
                return i % 2 === 0 ? ch.toUpperCase() : ch.toLowerCase();
            }).join('');
        }
    };

    const njk = expressNunjucks(app, {
        globals: globals
    });

    app.get('/', (req, res) => {
        res.render('globals', {title: 'snake'});
    });

    const res = await request(app)
        .get('/')
        .expect(200);

    t.regex(res.text, /SnAkE/);
});


test('custom tags', async t => {
    const app = express();
    app.set('views', __dirname + '/templates');

    const tags = {
        blockStart: '<%',
        blockEnd: '%>',
        variableStart: '<$',
        variableEnd: '$>',
        commentStart: '<#',
        commentEnd: '#>'
    };

    const njk = expressNunjucks(app, {
        tags: tags
    });

    app.get('/', (req, res) => {
        res.render('tags', {title: 'custom tags'});
    });

    const res = await request(app)
        .get('/')
        .expect(200);

    t.regex(res.text, /custom tags/);
});


test('get env', async t => {
    const app = express();
    app.set('views', __dirname + '/templates');

    const njk = expressNunjucks(app);

    t.is(njk.env instanceof nunjucks.Environment, true);
});


test('extended', async t => {
    const app = express();
    app.set('views', __dirname + '/templates');

    const njk = expressNunjucks(app);

    app.get('/', (req, res) => {
        res.render('extended', {title: 'base page'});
    });

    const res = await request(app)
        .get('/')
        .expect(200);

    t.regex(res.text, /base page/);
    t.regex(res.text, /extended page/);
});


test('multiple dirs', async t => {
    const app = express();
    app.set('views', [__dirname + '/templates', __dirname + '/templates1']);

    const njk = expressNunjucks(app);

    app.get('/', (req, res) => {
        res.render('multiple-dirs', {title: 'base page'});
    });

    const res = await request(app)
        .get('/')
        .expect(200);

    t.regex(res.text, /base page/);
    t.regex(res.text, /multiple dirs/);
});


test('custom extension', async t => {
    const app = express();

    app.set('views', __dirname + '/templates');
    app.set('view engine', 'njk');

    const njk = expressNunjucks(app);

    app.get('/', (req, res) => {
        res.render('custom-ext', {title: 'custom ext'});
    });

    const res = await request(app)
        .get('/')
        .expect(200);

    t.regex(res.text, /custom ext/);
});


test('expressNunjucks', async t => {
    t.throws(() => {
        const njk = expressNunjucks();
    });
});


test('context processors', async t => {
    const app = express();
    app.set('views', __dirname + '/templates');

    const njk = expressNunjucks(app);

    const assetsCtxProcessor = (req, ctx) => {
        ctx.scripts = ['index.js'];
        ctx.styles = ['index.css'];
    };

    app.use(njk.ctxProc([
        assetsCtxProcessor
    ]));

    app.get('/', (req, res) => {
        res.render('ctx-proc', {title: 'ctx proc'});
    });

    const res = await request(app)
        .get('/')
        .expect(200);

    t.regex(res.text, /ctx proc/);
    t.regex(res.text, /index\.js/);
    t.regex(res.text, /index\.css/);
});


test('multiple apps', async t => {
    const app = express();
    app.set('views', __dirname + '/templates');

    const subApp = express();
    subApp.set('views', __dirname + '/subapp/templates');

    const njk = expressNunjucks([app, subApp]);

    app.get('/', (req, res) => {
        res.render('index');
    });

    subApp.get('/subapp', (req, res) => {
        res.render('subapp/index');
    });

    app.use(subApp);

    const res0 = await request(app)
        .get('/')
        .expect(200);

    t.regex(res0.text, /app index/);


    const res1 = await request(subApp)
        .get('/subapp')
        .expect(200);

    t.regex(res1.text, /subapp index/);
});


test('override subapp template', async t => {
    const app = express();
    app.set('views', [
        __dirname + '/templates',
        __dirname + '/templates1'
    ]);

    const subApp = express();
    subApp.set('views', __dirname + '/subapp/templates');

    const njk = expressNunjucks([app, subApp]);

    subApp.get('/', (req, res) => {
        res.render('subapp/index');
    });

    app.use(subApp);

    const res = await request(app)
        .get('/')
        .expect(200);

    t.regex(res.text, /override subapp index/);
});


test('sync loader', async t => {
    const app = express();
    app.set('views', __dirname + '/loader');

    const njk = expressNunjucks(app, {
        loader: nunjucks.FileSystemLoader
    });

    app.get('/', (req, res) => {
        res.render('index');
    });

    const res = await request(app)
        .get('/')
        .expect(200);

    t.regex(res.text, /Post list/);
});


test('context processors app.render()', async t => {
    const app = express();
    app.set('views', __dirname + '/templates');

    const njk = expressNunjucks(app);

    const assetsCtxProcessor = (req, ctx) => {
        ctx.scripts = ['index.js'];
        ctx.styles = ['index.css'];
    };

    app.use(njk.ctxProc([
        assetsCtxProcessor
    ]));

    app.get('/', (req, res) => {
        app.render('ctx-proc', {title: 'ctx proc'}, function(err, html) {
            if (err) throw err;
            res.send(html);
        });
    });

    const res = await request(app)
        .get('/')
        .expect(200);

    t.regex(res.text, /ctx proc/);
});