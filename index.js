'use strict';

var nunjucks = require('nunjucks');
var Promise = require('bluebird');
var deprecate = require('depd')('express-nunjucks');


module.exports = {
    _env: null,
    _apps: [],
    _paths: [],
    _callbacks: [],
    nunjucks: nunjucks,

    /**
     * To connect your application to the template system.
     * @param {*} [app] - express application.
     * @param {Function} [cb] - function, which will be transferred environment.
     * @return {Promise} - which will be transferred environment.
     */
    register: function (app, cb) {
        var self = this;

        return new Promise(function (resolve, reject) {
            if (!app && !cb) {
                reject(new Error('Set parameters app or cb.'));
            } else {
                if (app) {
                    if (self._apps.indexOf(app) !== -1) {
                        throw new Error('Application already registered.');
                    }
                    self._apps.unshift(app);

                    var paths = app.get('views');

                    if (typeof paths === 'string') {
                        paths = [paths];
                    }

                    if (Array.isArray(paths)) {
                        self._paths = paths.concat(self._paths);
                    }
                }

                if (typeof cb === 'function') {
                    if (self._callbacks.indexOf(cb) !== -1) {
                        throw new Error('Callback already registered.');
                    }
                    self._callbacks.unshift(cb);
                }

                self._callbacks.unshift(resolve);
            }
        });
    },


    /**
     * To connect your application to the template system.
     * @param {*} app - express application.
     * @param {Function} [cb] - function, which will be transferred environment.
     * @deprecated
     */
    useApp: function (app, cb) {
        return this.register(app, cb);
    },
    /**
     * Configuring the template system.
     * @param {*} opts
     * @param {Boolean} [opts.autoescape=true] controls if output with dangerous characters are escaped automatically.
     * @param {Boolean} [opts.throwOnUndefined=false] throw errors when outputting a null/undefined value.
     * @param {Boolean} [opts.trimBlocks=false] automatically remove trailing newlines from a block/tag.
     * @param {Boolean} [opts.lstripBlocks=false] automatically remove leading whitespace from a block/tag.
     * @param {Boolean} [opts.watch=false] if true, the system will automatically update templates when they are changed on the filesystem.
     * @param {Boolean} [opts.noCache=false] if true, the system will avoid using a cache and templates will be recompiled every single time.
     * @param {*} [opts.tags] defines the syntax for nunjucks tags.
     * @param {*} [rootApp]
     * @param {Function} [cb] - function, which will be transferred environment.
     * @return {Promise} - which will be transferred environment.
     */
    setup: function (opts, rootApp, cb) {
        var self = this;

        return new Promise(function (resolve, reject) {
            opts = opts || {};

            if (rootApp) {
                self.register(rootApp, cb);
            }

            var loader = new nunjucks.FileSystemLoader(self._paths, opts);
            var env = new nunjucks.Environment(loader, opts);

            self._apps.forEach(function (app) {
                env.express(app);
            });

            self._callbacks.forEach(function (cb) {
                cb(env);
            });

            self._env = env;
            self._apps = [];
            self._paths = [];
            self._callbacks = [];

            resolve(env);
        });
    },
    /**
     * To wait for readiness of the template system.
     * @param {Function} [cb] - function, which will be transferred environment.
     * @return {Promise} - which will be transferred environment.
     */
    ready: function (cb) {
        var self = this;

        return new Promise(function (resolve, reject) {
            if (self._env) {
                if (typeof cb === 'function') {
                    cb(self._env);
                }
                resolve(self._env);
            } else {
                if (typeof cb === 'function') {
                    self._callbacks.push(cb);
                }
                self._callbacks.push(resolve);
            }
        });
    }
};

module.exports.useApp = deprecate.function(module.exports.useApp, 'use .register() instead .useApp()');