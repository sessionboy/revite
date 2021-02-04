import chalk from "chalk";
import esbuild,{ Message } from "esbuild"
import { prettifyMessage } from "./utils.js"

export const cleanStack = (stack: string)=> {
  return stack
    .split(/\n/g)
    .filter((l) => /^\s*at/.test(l))
    .join('\n')
}

export const handleEsbuildError = ({ err, contents, filePath, log}:any) =>{
  if (err.errors) {
    err.frame = ''
    err.errors.forEach((m: Message) => {
      err.frame += `\n` + prettifyMessage(m, contents)
    })
    err.loc = err.errors[0].location
  }
  if(err.frame){
    log.error(chalk.red(err.message),{ 
      markText:"revite:error", 
      timestamp: true 
    })    
    log.info(`File: ${chalk.cyanBright(filePath)}`);    
    log.info(chalk.yellow(err.frame));
  }
  return err;
} 