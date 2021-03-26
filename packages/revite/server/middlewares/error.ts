import chalk from 'chalk'
import { ServerContext } from "../types.js"

const splitRE = /\r?\n/
export function pad(source: string, n = 2) {
  const lines = source.split(splitRE)
  return lines.map((l) => ` `.repeat(n) + l).join(`\n`)
}

export function buildErrorMessage(
  err: any,
  args: string[] = [],
  includeStack = true
) {
  if (err.plugin) args.push(`  Plugin: ${chalk.magenta(err.plugin)}`)
  if (err.id) args.push(`  File: ${chalk.cyan(err.id)}`)
  if (err.frame) args.push(chalk.yellow(pad(err.frame)))
  if (includeStack && err.stack) args.push(pad(cleanStack(err.stack)))
  return args.join('\n')
}

function cleanStack(stack: string) {
  return stack
    .split(/\n/g)
    .filter((l) => /^\s*at/.test(l))
    .join('\n')
}

export default ({ config, ws, revite, app }: ServerContext)=>{
  app.use(async (err:any, req:any, res:any, next:any)=>{   
    if(err){
      const msg = buildErrorMessage(err, [
        chalk.red(`Internal server error: ${err.message}`)
      ])

      ws!.send({
        type:"error",
        title: "Build error: @revite/plugin-esm",
        errorMessage: msg,
        fileLoc: err.id,
        errorStackTrace: err.stack         
      })
      
      res.statusCode = 500
      res.end()
    }else{
      next()
    }

  })
}