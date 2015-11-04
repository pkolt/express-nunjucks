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
// mysite/index.js

var express = require('express');
var nunjucks = require('express-nunjucks');
var app1 = require('./app1');
var app2 = require('./app2');


var app = express();

app.set('view engine', 'html');

// Templates in this directory will override the application templates.
app.set('views', __dirname + '/templates');

// Configuring the template system.
nunjucks.setup({
    autoescape: true,
    watch: true
}, app);

app.get('/', function(req, res) {
    res.render('index', {title: 'Home page'});
});

app.use('/app1', app1);
app.use('/app2', app2);
// and more...

app.listen(8000);
```

### Sub application

```javascript
// mysite/app1/index.js

var express = require('express');
var nunjucks = require('express-nunjucks');


var app = express();

// Template dir(s)
app.set('views', __dirname + '/templates');

// Add application to template engine.
nunjucks.useApp(app, function(env) {
    // Add custom filter.
    env.addFilter('myfilter', function(str) {
        // ...
    });
});

// An alternative way.
nunjucks.ready(function(env) {
    // Add custom filter.
    env.addFilter('myfilter', function(str) {
        // ...
    });
});

app.get('/', function(req, res) {
    res.render('index', {title: 'This is first application!'});
});

module.exports = app;
```

## API

### nunjucks.useApp(app [,cb])

  Add application to template engine. In the callback function [environment][api_env] will come.

### nunjucks.setup([,opts] [,rootApp] [,cb])

  Sets the settings for templates. The available flags in opts is `autoescape`, `watch`, `noCache` and [tags][api_custom_tags].

### nunjucks.ready(cb)

  Calls the function when ready environment. In the callback function [environment][api_env] will come.

## Template hierarchy

```
rootApp
|
|- templates
|   |
|   |- base.html
|   |- app1
|       |
|       |- page.html
|
|- app1
|   |
|   |-templates
|      |
|      |-app1
|         |
|         |-page.html
|
|-app2
    |
    |-templates
```

The templates in the directory `rootApp/templates/app1` override templates `rootApp/app1/templates/app1`.

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
