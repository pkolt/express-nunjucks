# express-nunjucks [![Build Status](https://travis-ci.org/pkolt/express-nunjucks.svg?branch=master)](https://travis-ci.org/pkolt/express-nunjucks)

  Is the glue for [express](http://expressjs.com/) and [nunjucks](http://mozilla.github.io/nunjucks/).

## Features

  - Easy connection;
  - The use of common templates, filters and extensions;
  - Uses an asynchronous loader templates [nunjucks-async-loader](https://github.com/pkolt/nunjucks-async-loader).
  - Support context processors.

## Installation

```bash
$ npm install express-nunjucks
```

## API

### expressNunjucks([,config] [,cb]) -> Promise

  Add application to template engine.

#### config {Object}

  - **app** {Object} - root express application.
  - **subApp** {Object} - sub express application.
  - **templateDirs** {Array} - array of directories where templates are located.
  - **ctxProcessors** {Array} - array of context processors.
  - **extname='html'** {String} - the file extension for your templates. Allows not to write the extension in `res.render()`.
  - **watch=false** {Boolean} - if true, the system will automatically update templates when they are changed on the filesystem.
  - **noCache=false** {Boolean} - if true, the system will avoid using a cache and templates will be recompiled every single time.
  - **autoescape=true** {Boolean} - controls if output with dangerous characters are escaped automatically.
  - **throwOnUndefined=false** {Boolean} - throw errors when outputting a null/undefined value.
  - **trimBlocks=false** {Boolean} - automatically remove trailing newlines from a block/tag.
  - **lstripBlocks=false** {Boolean} - automatically remove leading whitespace from a block/tag.
  - **tags** - defines the syntax for nunjucks tags.

#### cb {Function}

  In the callback function [environment][api_env] will come.

### [deprecated] expressNunjucks.register(subApp [,cb]) -> Promise

  **Will be removed in version 2.0**
  Add application to template engine. In the callback function [environment][api_env] will come.

### [deprecated] expressNunjucks.setup([,opts] [,rootApp] [,cb]) -> Promise

  **Will be removed in version 2.0**
  Sets the settings for templates. The available flags in opts is `autoescape`, `watch`, `noCache` and [tags][api_custom_tags].

### [deprecated] expressNunjucks.ready(cb) -> Promise

  **Will be removed in version 2.0**
  Calls the function when ready environment. In the callback function [environment][api_env] will come.

## Usage

### Basic usage


```javascript
const express = require('express');
const expressNunjucks = require('express-nunjucks');
const app = express();
const isDev = app.get('env') === 'development';

app.use(expressNunjucks({
    app: app,
    watch: isDev,
    noCache: isDev,
    templateDirs: [__dirname + '/templates']
}));

app.get('/', (req, res) => {
    res.render('index');
});

app.listen(3000);
```

### Use filters

Create [custom filters][api_custom_filters] in nunjucks.

```javascript
const express = require('express');
const expressNunjucks = require('express-nunjucks');
const filters = require('./filters');

app.use(expressNunjucks({
    app: app,
    templateDirs: [__dirname + '/templates']
}, (env) => {
    // Add custom filter.
    Object.keys(filters).forEach((name) => {
        env.addFilter(name, filters[name]);
    });
}));

app.get('/', (req, res) => {
    res.render('index');
});

app.listen(3000);
```

### Use context processors

  Context processors is one great idea from the [django framework][django_ctx_processors].

```javascript
const express = require('express');
const expressNunjucks = require('express-nunjucks');
const webpackAssets = require('./build/assets');

// Adds information about the request in the context of the template.
const reqCtxProcessor = (req, ctx) => {
    ctx.req = req;
};
// Adds links to statics in the context of the template.
const AssetsCtxProcessor = (req, ctx) => {
    ctx.scripts = webpackAssets.scripts;
    ctx.styles = webpackAssets.styles;
};

app.use(expressNunjucks({
    app: app,
    templateDirs: [__dirname + '/templates'],
    ctxProcessors: [reqCtxProcessor, AssetsCtxProcessor]
}));

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


app.use(expressNunjucks({
    app: app,
    templateDirs: [__dirname + '/templates']
}));


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
const expressNunjucks = require('express-nunjucks');
const app = express();

app.use(expressNunjucks({
    subApp: app,
    templateDirs: [__dirname + '/templates']
}));

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
|   |-subApp
|      |
|      |-page.html
|
|- subApp
    |
    |-templates
       |
       |-subApp
          |
          |-index.html
          |-page.html
```

The templates in the directory `proj/templates/subApp` override templates `proj/subApp/templates/subApp`.

## Tests

  To run the test suite, first install the dependencies, then run `npm test`:

```bash
$ npm install
$ npm test
```

## License

  [MIT](LICENSE.md)

[django_ctx_processors]: https://docs.djangoproject.com/en/1.9/ref/templates/api/#built-in-template-context-processors
[api_custom_filters]: http://mozilla.github.io/nunjucks/api.html#custom-filters
[api_env]: http://mozilla.github.io/nunjucks/api.html#environment
[api_custom_tags]: http://mozilla.github.io/nunjucks/api.html#customizing-syntax
