import consola from 'consola'
import exit from 'exit'
import { fatalBox } from './utils/formatting.js'

let _setup = false

export default ({ dev }:any)=> {
  // Apply default NODE_ENV if not provided
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = dev ? 'development' : 'production'
  }

  if (_setup) return;
  _setup = true

  // 全局错误处理
  process.on('unhandledRejection', (err) => {
    consola.error(err)
  })

  // 致命错误退出流程
  consola.addReporter({
    log (logObj) {
      if (logObj.type === 'fatal') {
        const errorMessage = String(logObj.args[0])
        process.stderr.write(fatalBox(errorMessage))
        exit(1)
      }
    }
  })

  // Wrap all console logs with consola for better DX
  consola.wrapConsole()
}
