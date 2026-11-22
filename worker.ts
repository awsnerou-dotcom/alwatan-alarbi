import { buildHandler } from './worker/app.ts';

const handle = buildHandler();

export default {
  fetch: (request: Request) => handle(request),
};
