// Tiny Express-compatible router for Cloudflare Workers (no Node http, no body-parser).
/* eslint-disable @typescript-eslint/no-explicit-any */
export class Request_ {
  body: any = {};
  params: Record<string, string> = {};
  headers: Record<string, string> = {};
  query: Record<string, string> = {};
  authUser?: any;
  constructor(public method: string, public path: string) {}
}

export class Response_ {
  statusCode = 200;
  private hdrs = new Headers();
  private payload: BodyInit | null = null;
  done: Promise<void>;
  private finish!: () => void;
  ended = false;
  constructor() {
    this.done = new Promise((r) => (this.finish = r));
  }
  status(code: number) {
    this.statusCode = code;
    return this;
  }
  setHeader(k: string, v: string) {
    this.hdrs.set(k, v);
    return this;
  }
  json(obj: unknown) {
    this.hdrs.set('Content-Type', 'application/json; charset=utf-8');
    return this.end(JSON.stringify(obj));
  }
  end(chunk?: BodyInit | Uint8Array | null) {
    if (this.ended) return this;
    this.ended = true;
    this.payload = (chunk as BodyInit) ?? null;
    this.finish();
    return this;
  }
  toResponse() {
    return new Response([204, 304].includes(this.statusCode) ? null : this.payload, {
      status: this.statusCode,
      headers: this.hdrs,
    });
  }
}

export type Next = () => void;
export type Handler = (req: Request_, res: Response_, next: Next) => unknown;
type Route = { method: string | null; prefix?: string; pattern?: RegExp; keys: string[]; handlers: Handler[] };

function compile(path: string) {
  const keys: string[] = [];
  const re = path.replace(/:([A-Za-z0-9_]+)/g, (_m, k) => (keys.push(k), '([^/]+)'));
  return { keys, pattern: new RegExp(`^${re}/?$`) };
}

export function createApp() {
  const routes: Route[] = [];
  const hooks: Array<() => Promise<Response | void>> = [];
  const add = (method: string) => (path: string, ...handlers: Handler[]) => {
    routes.push({ method, ...compile(path), handlers });
  };
  const app = {
    get: add('GET'),
    post: add('POST'),
    put: add('PUT'),
    delete: add('DELETE'),
    use(prefix: string | string[], ...handlers: Handler[]) {
      for (const p of Array.isArray(prefix) ? prefix : [prefix]) routes.push({ method: null, prefix: p, keys: [], handlers });
    },
    afterResponse(fn: () => Promise<Response | void>) {
      hooks.push(fn);
    },
    async fetch(request: Request): Promise<Response> {
      const url = new URL(request.url);
      const req = new Request_(request.method, url.pathname);
      request.headers.forEach((v, k) => (req.headers[k.toLowerCase()] = v));
      url.searchParams.forEach((v, k) => (req.query[k] = v));
      if (!['GET', 'HEAD'].includes(request.method) && (req.headers['content-type'] || '').includes('json')) {
        try {
          const text = await request.text();
          req.body = text ? JSON.parse(text) : {};
        } catch {
          return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
        }
      }
      const res = new Response_();
      const chain: Array<{ h: Handler; params?: Record<string, string> }> = [];
      for (const r of routes) {
        if (r.method === null) {
          if (url.pathname === r.prefix || url.pathname.startsWith(`${r.prefix}/`)) r.handlers.forEach((h) => chain.push({ h }));
        } else if (r.method === request.method || (r.method === 'GET' && request.method === 'HEAD')) {
          const m = r.pattern!.exec(url.pathname);
          if (m) {
            const params: Record<string, string> = {};
            r.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
            r.handlers.forEach((h) => chain.push({ h, params }));
            break;
          }
        }
      }
      let i = 0;
      const next: Next = () => {
        const step = chain[i++];
        if (!step) {
          if (!res.ended) res.status(404).json({ error: 'Not found' });
          return;
        }
        if (step.params) req.params = step.params;
        try {
          const out = step.h(req, res, next);
          if (out && typeof (out as Promise<unknown>).catch === 'function') {
            (out as Promise<unknown>).catch((e) => {
              console.error(e);
              if (!res.ended) res.status(500).json({ error: 'Internal error' });
            });
          }
        } catch (e) {
          console.error(e);
          if (!res.ended) res.status(500).json({ error: 'Internal error' });
        }
      };
      next();
      await res.done;
      // A hook may replace the response (e.g. when saving the data failed).
      for (const h of hooks) {
        const override = await h();
        if (override) return override;
      }
      return res.toResponse();
    },
  };
  return app;
}
