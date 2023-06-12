import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import request from 'supertest';
import nunjucks from 'nunjucks';
import expressNunjucks, { type ContextProcessor } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(dirname(__filename), './test');

test('simple page', async () => {
  const app = express();
  app.set('views', __dirname + '/templates');

  expressNunjucks(app);

  app.get('/', (req, res) => {
    res.render('simple', { title: 'simple page' });
  });

  const res = await request(app).get('/').expect(200);

  assert.match(res.text, /simple page/);
});

test('custom filters', async () => {
  const app = express();
  app.set('views', __dirname + '/templates');

  const filters = {
    snake: function (text: string) {
      return (text || '')
        .split('')
        .map(function (ch, i) {
          return i % 2 === 0 ? ch.toUpperCase() : ch.toLowerCase();
        })
        .join('');
    },
  };

  expressNunjucks(app, {
    filters: filters,
  });

  app.get('/', (req, res) => {
    res.render('filters', { title: 'snake' });
  });

  const res = await request(app).get('/').expect(200);

  assert.match(res.text, /SnAkE/);
});

test('custom globals', async () => {
  const app = express();
  app.set('views', __dirname + '/templates');

  const globals = {
    snake: function (text: string) {
      return (text || '')
        .split('')
        .map(function (ch, i) {
          return i % 2 === 0 ? ch.toUpperCase() : ch.toLowerCase();
        })
        .join('');
    },
  };

  expressNunjucks(app, {
    globals: globals,
  });

  app.get('/', (req, res) => {
    res.render('globals', { title: 'snake' });
  });

  const res = await request(app).get('/').expect(200);

  assert.match(res.text, /SnAkE/);
});

test('custom tags', async () => {
  const app = express();
  app.set('views', __dirname + '/templates');

  const tags = {
    blockStart: '<%',
    blockEnd: '%>',
    variableStart: '<$',
    variableEnd: '$>',
    commentStart: '<#',
    commentEnd: '#>',
  };

  expressNunjucks(app, {
    tags: tags,
  });

  app.get('/', (req, res) => {
    res.render('tags', { title: 'custom tags' });
  });

  const res = await request(app).get('/').expect(200);

  assert.match(res.text, /custom tags/);
});

test('get env', async () => {
  const app = express();
  app.set('views', __dirname + '/templates');

  const njk = expressNunjucks(app);

  assert.ok(njk.env instanceof nunjucks.Environment);
});

test('extended', async () => {
  const app = express();
  app.set('views', __dirname + '/templates');

  expressNunjucks(app);

  app.get('/', (req, res) => {
    res.render('extended', { title: 'base page' });
  });

  const res = await request(app).get('/').expect(200);

  assert.match(res.text, /base page/);
  assert.match(res.text, /extended page/);
});

test('multiple dirs', async () => {
  const app = express();
  app.set('views', [__dirname + '/templates', __dirname + '/templates1']);

  expressNunjucks(app);

  app.get('/', (req, res) => {
    res.render('multiple-dirs', { title: 'base page' });
  });

  const res = await request(app).get('/').expect(200);

  assert.match(res.text, /base page/);
  assert.match(res.text, /multiple dirs/);
});

test('custom extension', async () => {
  const app = express();

  app.set('views', __dirname + '/templates');
  app.set('view engine', 'njk');

  expressNunjucks(app);

  app.get('/', (req, res) => {
    res.render('custom-ext', { title: 'custom ext' });
  });

  const res = await request(app).get('/').expect(200);

  assert.match(res.text, /custom ext/);
});

test('expressNunjucks', async () => {
  assert.throws(() => {
    expressNunjucks();
  });
});

test('context processors', async () => {
  const app = express();
  app.set('views', __dirname + '/templates');

  const njk = expressNunjucks(app);

  const assetsCtxProcessor: ContextProcessor = (req, ctx) => {
    ctx.scripts = ['index.js'];
    ctx.styles = ['index.css'];
  };

  app.use(njk.ctxProc([assetsCtxProcessor]));

  app.get('/', (req, res) => {
    res.render('ctx-proc', { title: 'ctx proc' });
  });

  const res = await request(app).get('/').expect(200);

  assert.match(res.text, /ctx proc/);
  assert.match(res.text, /index\.js/);
  assert.match(res.text, /index\.css/);
});

test('multiple apps', async () => {
  const app = express();
  app.set('views', __dirname + '/templates');

  const subApp = express();
  subApp.set('views', __dirname + '/subapp/templates');

  expressNunjucks([app, subApp]);

  app.get('/', (req, res) => {
    res.render('index');
  });

  subApp.get('/subapp', (req, res) => {
    res.render('subapp/index');
  });

  app.use(subApp);

  const res0 = await request(app).get('/').expect(200);

  assert.match(res0.text, /app index/);

  const res1 = await request(subApp).get('/subapp').expect(200);

  assert.match(res1.text, /subapp index/);
});

test('override subapp template', async () => {
  const app = express();
  app.set('views', [__dirname + '/templates', __dirname + '/templates1']);

  const subApp = express();
  subApp.set('views', __dirname + '/subapp/templates');

  expressNunjucks([app, subApp]);

  subApp.get('/', (req, res) => {
    res.render('subapp/index');
  });

  app.use(subApp);

  const res = await request(app).get('/').expect(200);

  assert.match(res.text, /override subapp index/);
});

test('sync loader', async () => {
  const app = express();
  app.set('views', __dirname + '/loader');

  expressNunjucks(app, {
    loader: nunjucks.FileSystemLoader,
  });

  app.get('/', (req, res) => {
    res.render('index');
  });

  const res = await request(app).get('/').expect(200);

  assert.match(res.text, /Post list/);
});

test('context processors app.render()', async () => {
  const app = express();
  app.set('views', __dirname + '/templates');

  const njk = expressNunjucks(app);

  const assetsCtxProcessor: ContextProcessor = (req, ctx) => {
    ctx.scripts = ['index.js'];
    ctx.styles = ['index.css'];
  };

  app.use(njk.ctxProc([assetsCtxProcessor]));

  app.get('/', (req, res) => {
    app.render('ctx-proc', { title: 'ctx proc' }, function (err, html) {
      if (err) throw err;
      res.send(html);
    });
  });

  const res = await request(app).get('/').expect(200);

  assert.match(res.text, /ctx proc/);
});
