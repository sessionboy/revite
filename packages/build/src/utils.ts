import { Message } from "esbuild"
import chalk from 'chalk'
import { mediaReg, styleReg, scriptReg, htmlReg } from "./plugins/config.js"

export const getOutputExt = (ext: string, outputExt:string)=>{
  if(scriptReg.test(ext)){
    return outputExt;
  }
  if(styleReg.test(ext)){
    return ".css"
  }
  if(htmlReg.test(ext)){
    return ".html"
  }
  if(mediaReg.test(ext)){
    return ext;
  }
  return null;
}

const splitRE = /\r?\n/
const range: number = 2

export const prettifyMessage =(m: Message, code: string): string => {
  let res = chalk.yellow(m.text)
  if (m.location) {
    const lines = code.split(/\r?\n/g)
    const line = Number(m.location.line)
    const column = Number(m.location.column)
    const offset =
      lines
        .slice(0, line - 1)
        .map((l) => l.length)
        .reduce((total, l) => total + l + 1, 0) + column
    res += `\n` + generateCodeFrame(code, offset, offset + 1)
  }
  return res + `\n`
}

export function generateCodeFrame(
  source: string,
  start: number | { line: number; column: number } = 0,
  end?: number
): string {
  start = posToNumber(source, start)
  end = end || start
  const lines = source.split(splitRE)
  let count = 0
  const res: string[] = []
  for (let i = 0; i < lines.length; i++) {
    count += lines[i].length + 1
    if (count >= start) {
      for (let j = i - range; j <= i + range || end > count; j++) {
        if (j < 0 || j >= lines.length) continue
        const line = j + 1
        res.push(
          `${line}${' '.repeat(Math.max(3 - String(line).length, 0))}|  ${
            lines[j]
          }`
        )
        const lineLength = lines[j].length
        if (j === i) {
          // push underline
          const pad = start - (count - lineLength) + 1
          const length = Math.max(
            1,
            end > count ? lineLength - pad : end - start
          )
          res.push(`   |  ` + ' '.repeat(pad) + '^'.repeat(length))
        } else if (j > i) {
          if (end > count) {
            const length = Math.max(Math.min(end - count, lineLength), 1)
            res.push(`   |  ` + '^'.repeat(length))
          }
          count += lineLength + 1
        }
      }
      break
    }
  }
  return res.join('\n')
}

export function posToNumber(
  source: string,
  pos: number | { line: number; column: number }
): number {
  if (typeof pos === 'number') return pos
  const lines = source.split(splitRE)
  const { line, column } = pos
  let start = 0
  for (let i = 0; i < line - 1; i++) {
    start += lines[i].length + 1
  }
  return start + column
}