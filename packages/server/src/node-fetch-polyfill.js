import fetch, { Headers, Request, Response } from 'node-fetch'

if (!global.fetch) {
  global.fetch = fetch
  global.Headers = Headers
  global.Request = Request
  global.Response = Response
}
