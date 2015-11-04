var nunjucks = require('nunjucks');


module.exports = {
    env: null,
    apps: [],
    paths: [],
    callbacks: [],
    /**
     * To connect your application to the template system.
     * @param {*} app - express application.
     * @param {Function} [cb] - function which will be passed environment.
     */
    useApp: function(app, cb) {
        if (this.env) {
            throw new Error('The template system is already initialized.');
        }

        if (!app) {
            throw new Error('Is not set app: ' + app);
        }
        this.apps.unshift(app);

        var path = app.get('views');
        if (typeof path === 'string' || Array.isArray(path)) {
            if (typeof path === 'string') {
                path = [path];
            }
            // Add to beginning of array.
            this.paths.splice.apply(this.paths, [0, 0].concat(path));
        }

        if (typeof cb === 'function') {
            this.callbacks.unshift(cb);
        }
    },
    /**
     * Configuring the template system.
     * @param {*} opts
     * @param {Boolean} [opts.autoescape=false]
     * @param {Boolean} [opts.watch=false]
     * @param {Boolean} [opts.noCache=false]
     * @param {*} [opts.tags]
     * @param {*} [rootApp]
     * @param {Function} [cb]
     */
    setup: function(opts, rootApp, cb) {
        if (this.env) {
            throw new Error('The template system is already initialized.')
        }

        opts = opts || {};

        if (rootApp) {
            this.useApp(rootApp, cb);
        }

        var loader = new nunjucks.FileSystemLoader(this.paths, opts),
            env = new nunjucks.Environment(loader, opts);

        this.apps.forEach(function(app) {
            env.express(app);
        });

        this.callbacks.forEach(function(cb) {
            cb(env);
        });

        this.env = env;
        this.apps = [];
        this.paths = [];
        this.callbacks = [];
    },
    /**
     * To wait for readiness of the template system.
     * @param {Function} cb - function which will be passed environment.
     */
    ready: function(cb) {
        if (this.env) {
            cb(this.env);
        } else {
            this.callbacks.push(cb);
        }
    }
};
