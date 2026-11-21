import { buildApp } from './worker/app.ts';

const app = buildApp();

export default {
  fetch: (request: Request) => app.fetch(request),
};
