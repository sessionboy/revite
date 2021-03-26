import { Command } from 'cac';

const commands = {
  start: () => import('./start.js'),
  dev: () => import('./dev.js'),
  build: () => import('./build.js'),
  help: () => import('./help.js')
}

export type CommandType = "dev" | "start" | "build" | "help";

export default (name: CommandType) => commands[name]().then(m => m.default);
