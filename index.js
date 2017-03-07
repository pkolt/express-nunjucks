'use strict';

const path = require('path');
const nunjucks = require('nunjucks');
const NunjucksAsyncLoader = require('nunjucks-async-loader');
const assign = require('assign-deep');


module.exports = function(apps, config) {
    apps = apps || [];
    apps = Array.isArray(apps) ? apps : [apps];
    config = config || {};

    if (!apps.length) {
        throw new Error('option apps required.');
    }

    let templateDirs = [];
    apps.forEach(app => {
        templateDirs = templateDirs.concat(app.get('views'));
    });

    const Loader = config.loader || NunjucksAsyncLoader;
    const loader = new Loader(templateDirs, {
        watch: config.watch,
        noCache: config.noCache
    });

    let envOpts = {};
    ['autoescape', 'throwOnUndefined', 'trimBlocks', 'lstripBlocks', 'tags'].forEach(name => {
        if (config.hasOwnProperty(name)) {
            envOpts[name] = config[name];
        }
    });

    const env = new nunjucks.Environment(loader, envOpts);

    const filters = config.filters;
    if (filters) {
        Object.keys(filters).forEach(name => {
            env.addFilter(name, filters[name]);
        });
    }

    const globals = config.globals;
    if (globals) {
        Object.keys(globals).forEach(name => {
            env.addGlobal(name, globals[name]);
        });
    }

    const engine = function(filePath, ctx, cb) {
        const view = this;
        const name = path.extname(view.name) ? view.name : view.name + view.ext;

        const njkCtx = ctx._locals && ctx._locals.njkCtx;
        if (njkCtx) {
            ctx = assign({}, ctx, njkCtx);
        }

        env.render(name, ctx, cb);
    };

    apps.forEach(app => {
        let engineName = app.get('view engine');

        if (!engineName) {
            engineName = 'html';
            app.set('view engine', engineName);
        }

        app.engine(engineName, engine);
    });

    return {
        env: env,
        ctxProc: function(ctxProcessors) {
            if (!ctxProcessors) {
                throw new Error('option ctxProcessors required.');
            }

            return (req, res, next) => {
                const ctx = res.locals.njkCtx || {};

                ctxProcessors.forEach(ctxProc => {
                    ctxProc(req, ctx);
                });

                res.locals.njkCtx = ctx;

                next();
            };
        }
    };
};
