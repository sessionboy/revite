import { sep } from 'path'
import chalk from 'chalk'
import readline from 'readline'
import { getType } from "./common.js"

export type LogType = 'error' | 'warn' | 'info';
export type LogLevel = LogType | 'silent'
export interface LogOptions {
  clear?: boolean
  timestamp?: boolean
  markText?: string|undefined|null
}

export interface LoggerOptions {
  level?: LogLevel
  allowClearScreen?: boolean
}

let lastType: LogType | undefined
let lastMsg: string | undefined
let sameCount = 0
const LogLevels: Record<LogLevel, number> = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3
}
const defaultLogOptions: LogOptions  = {
  timestamp: false,
  markText: null
}

export default class Logger {
  private hasError: boolean = false;
  private level: LogLevel = "info";
  private allowClearScreen: boolean|undefined = true;

  constructor(options?: LoggerOptions){
    if(options?.level){
      this.level = options.level;
    }
    if(options && getType(options.allowClearScreen) === "Boolean"){
      this.allowClearScreen = options.allowClearScreen;
    }
  }

  private print(
    type: LogType, 
    msg: string, 
    _options?: LogOptions
  ) {
    const options = { ...defaultLogOptions, ..._options||{} };
    const thresh = LogLevels[this.level];
    if (thresh < LogLevels[type]) return ;
    
    const method = type === 'info' ? 'log' : type
    let mark; 
    if(options.markText){
      const markText = `[${options.markText}]`;
      if(type == "info"){
        mark = chalk.greenBright.bold(markText);
      }
      if(type === "warn"){
        mark = chalk.yellow.bold(markText);
      }
      if(type === "error"){
        mark = chalk.red.bold(markText);
        const cwd = process.cwd() + sep;
        msg = msg.replace('file://', '').replace(cwd, '');
      }
      msg = `${mark} ${msg}`;
    }
    
    if(options.timestamp){
      msg = `${chalk.dim(new Date().toLocaleTimeString())} ${msg}`;
    }
    
    if (type === lastType && msg === lastMsg) {
      sameCount++
      this.clearScreen()
      console[method](msg, chalk.yellow(`(x${sameCount + 1})`))
    } else {
      sameCount = 0
      lastMsg = msg
      lastType = type
      if (options.clear) {
        this.clearScreen()
      }
      // console[method](msg)
      console.log(msg)
    }
  }
  
  info(msg: string, options?: LogOptions){
    if(this.hasError){
      this.clearScreen();
      this.hasError = false;
    }
    this.print('info', msg, options);
  }

  warn(msg: string, options?: LogOptions){
    this.print('warn', msg, options);
  }

  error(msg: string, options?: LogOptions){
    this.hasError = true;
    this.print('error', msg, options);
  }

  clearScreen() {
    if(!this.allowClearScreen) return;
    const blank = '\n'.repeat(process.stdout.rows - 2)
    console.log(blank)
    readline.cursorTo(process.stdout, 0, 0)
    readline.clearScreenDown(process.stdout)
  }
}