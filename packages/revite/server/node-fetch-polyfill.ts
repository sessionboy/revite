import fetch, { Headers, Request, Response } from 'node-fetch'

if (!global.fetch) {
  (global as any).fetch = fetch;
  (global as any).Headers = Headers;
  (global as any).Request = Request;
  (global as any).Response = Response;
}
