# express-nunjucks [![Build Status](https://travis-ci.org/pkolt/express-nunjucks.svg?branch=master)](https://travis-ci.org/pkolt/express-nunjucks)

  Is the glue for [express](http://expressjs.com/) and [nunjucks](http://mozilla.github.io/nunjucks/).

## Features

  - Easy connection;
  - The use of common templates, filters and extensions.

## Installation

```bash
$ npm install express-nunjucks
```

## Usage

### General application

```javascript
// proj/index.js

const express = require('express');
const nunjucks = require('express-nunjucks');
const app = require('./app');
const rootApp = express();

// Default extension of template files.
rootApp.set('view engine', 'html');

// Templates in this directory will override the application templates.
rootApp.set('views', __dirname + '/templates');

// Configuring the template system.
nunjucks.setup({
    // (default: true) controls if output with dangerous characters are escaped automatically.
    autoescape: true,
    // (default: false) throw errors when outputting a null/undefined value.
    throwOnUndefined: false,
    // (default: false) automatically remove trailing newlines from a block/tag.
    trimBlocks: false,
    // (default: false) automatically remove leading whitespace from a block/tag.
    lstripBlocks: false,
    // (default: false) if true, the system will automatically update templates when they are changed on the filesystem.
    watch: true,
    // (default: false) if true, the system will avoid using a cache and templates will be recompiled every single time.
    noCache: true,
    // (default: see nunjucks syntax) defines the syntax for nunjucks tags.
    tags: {}
}, rootApp);

rootApp.get('/', function(req, res) {
    res.render('index', {title: 'Home page'});
});

rootApp.use('/app', app);
// and more...

rootApp.listen(8000);
```

### Sub application

```javascript
// proj/app/index.js

const express = require('express');
const nunjucks = require('express-nunjucks');
const filters = require('./filters');
const app = express();

// Template dir(s)
app.set('views', __dirname + '/templates');

// Add application to template engine.
nunjucks.register(app);

// Add custom filter.
nunjucks.register(app).then(function(env) {
    // Add custom filter.
    Object.keys(filters).forEach(function(name) {
        env.addFilter(name, filters[name]);
    });
});

// Add custom filter (alternative way).
nunjucks.ready().then(function(env) {
    // Add custom filter.
    Object.keys(filters).forEach(function(name) {
        env.addFilter(name, filters[name]);
    });
});

app.get('/', function(req, res) {
    res.render('index', {title: 'Sub application page'});
});

module.exports = app;
```

## API

### nunjucks.register([,app] [,cb]) -> Promise

  Add application to template engine. In the callback function [environment][api_env] will come.

### nunjucks.setup([,opts] [,rootApp] [,cb]) -> Promise

  Sets the settings for templates. The available flags in opts is `autoescape`, `watch`, `noCache` and [tags][api_custom_tags].

### nunjucks.ready(cb) -> Promise

  Calls the function when ready environment. In the callback function [environment][api_env] will come.

## Template hierarchy

```
proj
|
|- templates
|   |
|   |- base.html
|   |- index.html
|   |-app
|      |
|      |-page.html
|
|- app
    |
    |-templates
       |
       |-app
          |
          |-index.html
          |-page.html
```

The templates in the directory `proj/templates/app` override templates `proj/app/templates/app`.

## Tests

  To run the test suite, first install the dependencies, then run `npm test`:

```bash
$ npm install
$ npm test
```

## License

  [MIT](LICENSE.md)

[api_env]: http://mozilla.github.io/nunjucks/api.html#environment
[api_custom_tags]: http://mozilla.github.io/nunjucks/api.html#customizing-syntax
