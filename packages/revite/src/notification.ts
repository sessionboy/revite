import { Server } from 'http'
import WebSocket from 'ws'
import { HMRMessage } from "@revite/types"

export default class Socket {
  public ws: WebSocket.Server;
  private server: Server;
  constructor(
    server: Server, 
    options: WebSocket.ServerOptions={ noServer: true }
  ){
    const ws = new WebSocket.Server(options);    
    this.ws = ws;
    this.server = server;
    this.ready();
  }

  ready(){
    this.server.on('upgrade', (req, socket, head) => {
      if (req.headers['sec-websocket-protocol'] === 'revite-hmr') {
        this.ws.handleUpgrade(req, socket, head, (ws) => {
          this.ws.emit('connection', ws, req)
        })
      }
    })

    this.ws.on('connection', (socket) => {
      socket.send(JSON.stringify({ type: 'connected' }))     
    })
  
    this.ws.on('error', (e: Error & { code: string }) => {
      if (e.code !== 'EADDRINUSE') {
        console.error(`WebSocket server error:\n${e.stack || e.message}`)
      }
    })
  }

  send(payload: HMRMessage) {
    if (payload.type === 'error' && !this.ws.clients.size) {
      // bufferedError = payload
      return
    }

    const stringified = JSON.stringify(payload)
    this.ws.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(stringified)
      }
    })
  }

  close() {
    return new Promise((resolve, reject) => {
      this.ws.close((err) => {
        if (err) {
          reject(err)
        } else {
          resolve(null)
        }
      })
    })
  }
}
