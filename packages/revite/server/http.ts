import { readFileSync } from "fs"
import { resolve } from "path"
import { createRequire } from "module"
import { InternalConfig } from '@revite/types'
import connect from "connect"
import { generate } from 'selfsigned'
const require = createRequire(import.meta.url);

export default (config: InternalConfig, app: connect.Server )=>{
  const cli = Boolean(process.env.CLI); 
  if(!cli) return null;
  const https = config.server.https;
  if(!https){
    return require("http").createServer(app);
  }
  const { ca, cert, key, pfx } = https;
  const httpsOption= Object.assign(https,{
    ca: readFile(ca),
    cert: readFile(cert),
    key: readFile(key),
    pfx: readFile(pfx)
  })
   if (!httpsOption.key || !httpsOption.cert) {
    httpsOption.cert = httpsOption.key = createCertificate()
  }
  return require('http2').createServer(httpsOption, app)
}

const readFile = (value?: string | Buffer | any[])=> {
  if (typeof value === 'string') {
    try {
      return readFileSync(resolve(value as string))
    } catch (e) {
      return value
    }
  }
  return value
}

/**
 * https://github.com/webpack/webpack-dev-server/blob/master/lib/utils/createCertificate.js
 *
 * Copyright JS Foundation and other contributors
 * This source code is licensed under the MIT license found in the
 * LICENSE file at
 * https://github.com/webpack/webpack-dev-server/blob/master/LICENSE
 */
const createCertificate = ()=> {
  const pems = generate(null, {
    algorithm: 'sha256',
    days: 30,
    keySize: 2048,
    extensions: [
      // {
      //   name: 'basicConstraints',
      //   cA: true,
      // },
      {
        name: 'keyUsage',
        keyCertSign: true,
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true,
        dataEncipherment: true
      },
      {
        name: 'extKeyUsage',
        serverAuth: true,
        clientAuth: true,
        codeSigning: true,
        timeStamping: true
      },
      {
        name: 'subjectAltName',
        altNames: [
          {
            // type 2 is DNS
            type: 2,
            value: 'localhost'
          },
          {
            type: 2,
            value: 'localhost.localdomain'
          },
          {
            type: 2,
            value: 'lvh.me'
          },
          {
            type: 2,
            value: '*.lvh.me'
          },
          {
            type: 2,
            value: '[::1]'
          },
          {
            // type 7 is IP
            type: 7,
            ip: '127.0.0.1'
          },
          {
            type: 7,
            ip: 'fe80::1'
          }
        ]
      }
    ]
  })
  return pems.private + pems.cert
}
