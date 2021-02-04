import wrapAnsi from 'wrap-ansi'
import chalk from 'chalk'
import boxen from 'boxen'
import { maxCharsPerLine } from './constants.js'

export function indent (count:number, chr = ' ') {
  return chr.repeat(count)
}

export function indentLines (string:string, spaces:any, firstLineSpaces:any) {
  const lines:any = Array.isArray(string) ? string : string.split('\n')
  let s = ''
  if (lines.length) {
    const i0 = indent(firstLineSpaces === undefined ? spaces : firstLineSpaces)
    s = i0 + lines.shift()
  }
  if (lines.length) {
    const i = indent(spaces)
    s += '\n' + lines.map((l:any) => i + l).join('\n')
  }
  return s
}

export function foldLines (
  string: string, 
  spaces: any, 
  firstLineSpaces: any, 
  charsPerLine = maxCharsPerLine()
) {
  return indentLines(wrapAnsi(string, charsPerLine), spaces, firstLineSpaces)
}

export function colorize (text:string) {
  return text
    .replace(/\[[^ ]+]/g, m => chalk.grey(m))
    .replace(/<[^ ]+>/g, m => chalk.green(m))
    .replace(/ (-[-\w,]+)/g, m => chalk.bold(m))
    .replace(/`([^`]+)`/g, (_, m) => chalk.bold.cyan(m))
}

export function box (message:any, title:string, options:any) {
  return boxen([
    title || chalk.white('Nuxt Message'),
    '',
    chalk.white(foldLines(message, 0, 0, maxCharsPerLine()))
  ].join('\n'), Object.assign({
    borderColor: 'white',
    borderStyle: 'round',
    padding: 1,
    margin: 1
  }, options)) + '\n'
}

export function successBox (message:any, title?:string) {
  return box(message, title || chalk.green('✔ Nuxt Success'), {
    borderColor: 'green'
  })
}

export function warningBox (message:any, title?:string) {
  return box(message, title || chalk.yellow('⚠ Nuxt Warning'), {
    borderColor: 'yellow'
  })
}

export function errorBox (message:any, title?:string) {
  return box(message, title || chalk.red('✖ Nuxt Error'), {
    borderColor: 'red'
  })
}

export function fatalBox (message:any, title?:string) {
  return errorBox(message, title || chalk.red('✖ Nuxt Fatal Error'))
}
