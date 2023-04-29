import path from 'node:path';
import type { Application, Request, Response, NextFunction } from 'express';
import nunjucks, { type ILoader, type ConfigureOptions } from 'nunjucks';
import NunjucksAsyncLoader from 'nunjucks-async-loader';

type Constructable<T = any> = new (...args: any[]) => T;
type LoaderType = Constructable<ILoader>;
type FilterFunc = (...args: any[]) => any;
type ContextProcessorContext = Record<string, any>;
export type ContextProcessor = (req: Request, ctx: ContextProcessorContext) => void;
interface EngineCallContext {
  name: string;
  ext: string;
}

const envKeys = ['autoescape', 'throwOnUndefined', 'trimBlocks', 'lstripBlocks', 'tags'] as const;
type EnvKeysType = (typeof envKeys)[number];
type EnvOptions = Pick<ConfigureOptions, EnvKeysType>;

interface Configuration extends EnvOptions {
  watch?: boolean;
  noCache?: boolean;
  filters?: Record<string, FilterFunc>;
  loader?: LoaderType;
  globals?: Record<string, any>;
}

export const expressNunjucks = (apps: Application | Application[] = [], config: Configuration = {}) => {
  apps = Array.isArray(apps) ? apps : [apps];
  const templateDirs: string[] = apps.map((app) => app.get('views')).flat();

  if (!apps.length) {
    throw new Error('option apps required.');
  }

  const Loader = (config.loader ?? NunjucksAsyncLoader) as LoaderType;
  const loader = new Loader(templateDirs, {
    watch: config.watch,
    noCache: config.noCache,
  });

  const envOpts: EnvOptions = envKeys.reduce((accum, name) => ({ ...accum, [name]: config[name] }), {});
  const env = new nunjucks.Environment(loader, envOpts);

  const filters = config.filters;
  if (filters) {
    Object.keys(filters).forEach((name) => {
      env.addFilter(name, filters[name]);
    });
  }

  const globals = config.globals;
  if (globals) {
    Object.keys(globals).forEach((name) => {
      env.addGlobal(name, globals[name]);
    });
  }

  const engine = function (
    this: EngineCallContext,
    filePath: string,
    ctx: Record<string, any>,
    cb: (...args: any[]) => void,
  ) {
    const self = this;
    const name = path.extname(self.name) ? self.name : self.name + self.ext;

    const njkCtx = ctx._locals && ctx._locals.njkCtx;
    if (njkCtx) {
      ctx = { ...ctx, ...njkCtx };
    }
    env.render(name, ctx, cb);
  };

  apps.forEach((app) => {
    let engineExt: string | undefined = app.get('view engine');

    if (!engineExt) {
      engineExt = 'html';
      app.set('view engine', engineExt);
    }

    app.engine(engineExt, engine);
  });

  return {
    env: env,
    ctxProc: (ctxProcessors: ContextProcessor[]) => (req: Request, res: Response, next: NextFunction) => {
      const ctx: ContextProcessorContext = (res.locals.njkCtx = res.locals.njkCtx ?? {});

      ctxProcessors.forEach((ctxProc) => {
        ctxProc(req, ctx);
      });

      next();
    },
  };
};

export default expressNunjucks;
