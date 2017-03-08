# express-nunjucks [![Build Status](https://travis-ci.org/pkolt/express-nunjucks.svg?branch=master)](https://travis-ci.org/pkolt/express-nunjucks)

  Is the glue for [express](http://expressjs.com/) and [nunjucks](http://mozilla.github.io/nunjucks/).

## Features

  - Easy connection.
  - Uses of common templates, filters and extensions.
  - Uses an asynchronous loader templates [nunjucks-async-loader](https://github.com/pkolt/nunjucks-async-loader).
  - Support context processors.

## Installation

```bash
$ npm install nunjucks express-nunjucks --save
```

## Usage

```javascript
const express = require('express');
const expressNunjucks = require('express-nunjucks');
const app = express();
const isDev = app.get('env') === 'development';

app.set('views', __dirname + '/templates');

const njk = expressNunjucks(app, {
    watch: isDev,
    noCache: isDev
});

app.get('/', (req, res) => {
    res.render('index');
});

app.listen(3000);
```

## API

### expressNunjucks(apps [,config]) -> njk

#### `apps {Object|Array}`

  [Express application][exp_app] or an array of applications.

#### `config {Object}`
  - `watch=false {Boolean}` - if true, the system will automatically update templates when they are changed on the filesystem.
  - `noCache=false {Boolean}` - if true, the system will avoid using a cache and templates will be recompiled every single time.
  - `autoescape=true {Boolean}` - controls if output with dangerous characters are escaped automatically.
  - `throwOnUndefined=false {Boolean}` - throw errors when outputting a null/undefined value.
  - `trimBlocks=false {Boolean}` - automatically remove trailing newlines from a block/tag.
  - `lstripBlocks=false {Boolean}` - automatically remove leading whitespace from a block/tag.
  - `tags` - defines the syntax for [nunjucks tags][njk_custom_tags].
  - `filters` - defines the syntax for [nunjucks filters][njk_custom_filters].
  - `loader` - defines [loader templates][njk_loader]. The default is the asynchronous loader templates.
  - `globals` - defines [global variables][njk_globals].

### njk.ctxProc(ctxProcessors) -> Middleware

  Creates [Express middleware][exp_middleware] to work context processors.

### njk.env -> Environment

  Returns [Nunjucks Environment][njk_env].

## Examples

### Use filters

Create [custom filters][njk_custom_filters] in nunjucks.

```javascript
const express = require('express');
const expressNunjucks = require('express-nunjucks');
const filters = require('./filters');

const app = express();

app.set('views', __dirname + '/templates');

const njk = expressNunjucks(app, {
    // Add custom filter.
    filters: filters
});

app.get('/', (req, res) => {
    res.render('index');
});

app.listen(3000);
```

### Use globals

Defines [globals][njk_globals] to use this in templates.

```javascript
const express = require('express');
const expressNunjucks = require('express-nunjucks');
const asset = require('./utils').asset;

const app = express();

app.set('views', __dirname + '/templates');

const njk = expressNunjucks(app, {
    // Defines globals.
    globals: {asset: asset}
});

app.get('/', (req, res) => {
    res.render('index');
});

app.listen(3000);
```

```html
...
<link rel="stylesheet" href="{{ asset('styles.css') }}">
...
```


### Use context processors

  Context processors is one great idea from the [django framework][dj_ctx_processors].

```javascript
const express = require('express');
const expressNunjucks = require('express-nunjucks');
const webpackAssets = require('./build/assets');

const app = express();

app.set('views', __dirname + '/templates');

// Adds information about the request in the context of the template.
const reqCtxProcessor = (req, ctx) => {
    ctx.req = req;
};
// Adds links to statics in the context of the template.
const assetsCtxProcessor = (req, ctx) => {
    ctx.scripts = webpackAssets.scripts;
    ctx.styles = webpackAssets.styles;
};

const njk = expressNunjucks(app);

app.use(njk.ctxProc([
    reqCtxProcessor,
    assetsCtxProcessor    
]));

app.get('/', (req, res) => {
    res.render('index');
});

app.listen(3000);
```

  **Warning!** Context processors not supported to `app.render()`.

### Use synchronous loader templates

```javascript
const express = require('express');
const expressNunjucks = require('express-nunjucks');

const app = express();

app.set('views', __dirname + '/templates');

const njk = expressNunjucks(app, {
    loader: nunjucks.FileSystemLoader
});

app.get('/', (req, res) => {
    res.render('index');
});

app.listen(3000);
```

### Use application and sub application

#### General application

```javascript
// proj/app.js

const express = require('express');
const expressNunjucks = require('express-nunjucks');
const subApp = require('./subapp');

const app = express();

app.set('views', __dirname + '/templates');

const njk = expressNunjucks([app, subApp]);

app.get('/', (req, res) => {
    res.render('index');
});

app.use('/subApp', subApp);
// and more...

app.listen(3000);
```

#### Sub application

```javascript
// proj/subapp/index.js

const express = require('express');
const app = express();

app.set('views', __dirname + '/templates');

app.get('/', (req, res) => {
    res.render('index');
});

module.exports = app;
```

#### Template hierarchy

```
proj
|
|- templates
|   |
|   |- base.html
|   |- index.html
|   |-subapp
|      |
|      |-page.html
|
|- subapp
    |
    |-templates
       |
       |-subapp
          |
          |-index.html
          |-page.html
```

The templates in the directory `proj/templates/subapp` override templates `proj/subapp/templates/subapp`.

## Tests

  To run the test suite, first install the dependencies, then run `npm test`:

```bash
$ npm install
$ npm test
```

## License

  [MIT](LICENSE.md)

[dj_ctx_processors]: https://docs.djangoproject.com/en/1.9/ref/templates/api/#built-in-template-context-processors
[njk_custom_filters]: http://mozilla.github.io/nunjucks/api.html#custom-filters
[njk_custom_tags]: http://mozilla.github.io/nunjucks/api.html#customizing-syntax
[njk_env]: http://mozilla.github.io/nunjucks/api.html#environment
[njk_loader]: https://mozilla.github.io/nunjucks/api.html#loader
[njk_globals]: http://mozilla.github.io/nunjucks/api.html#addglobal
[exp_engine]: http://expressjs.com/en/api.html#app.engine
[exp_app]: http://expressjs.com/en/api.html#app
[exp_middleware]: http://expressjs.com/en/guide/writing-middleware.html
