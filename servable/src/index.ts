import { serial, flatHooks, mergeHooks, isObject } from './utils.js'
import { LoggerT, hookFnT, configHooksT, deprecatedHookT, deprecatedHooksT } from './types.js'
export * from './types.js'

class Servable {
  private _hooks: { [name: string]: hookFnT[] }
  private _deprecatedHooks: deprecatedHooksT
  private _logger: LoggerT | false

  static mergeHooks: typeof mergeHooks
  mergeHooks: typeof mergeHooks|null = null

  constructor (logger: LoggerT | false = console) {
    this._logger = logger
    this._hooks = {}
    this._deprecatedHooks = {}

    // Allow destructuring hook and callHook functions out of instance object
    this.hook = this.hook.bind(this)
    this.callHook = this.callHook.bind(this)
  }

  hasHook(name: string): boolean{
    return Boolean(this._hooks[name]?.[0]);
  }

  hook (name: string, fn: hookFnT|null) {
    if (!name || typeof fn !== 'function') {
      return () => {}
    }

    const originalName = name
    let deprecatedHook
    while (this._deprecatedHooks[name]) {
      deprecatedHook = this._deprecatedHooks[name]
      if (typeof deprecatedHook === 'string') {
        deprecatedHook = { to: deprecatedHook }
      }
      name = deprecatedHook.to
    }
    if (deprecatedHook && this._logger) {
      if (!deprecatedHook.message) {
        this._logger.warn(
          `${originalName} hook has been deprecated` +
          (deprecatedHook.to ? `, please use ${deprecatedHook.to}` : '')
        )
      } else {
        this._logger.warn(deprecatedHook.message)
      }
    }

    this._hooks[name] = this._hooks[name] || []
    this._hooks[name].push(fn)

    return () => {
      if (fn) {
        this.removeHook(name, fn)
        fn = null // Free memory
      }
    }
  }

  hookOnce (name: string, fn: hookFnT) {
    let _unreg:any;
    let _fn: any = (...args:any) => {
      _unreg()
      _unreg = null
      _fn = null
      return fn(...args)
    }
    _unreg = this.hook(name, _fn)
    return _unreg
  }

  removeHook (name: string, fn: hookFnT) {
    if (this._hooks[name]) {
      const idx = this._hooks[name].indexOf(fn)

      if (idx !== -1) {
        this._hooks[name].splice(idx, 1)
      }

      if (this._hooks[name].length === 0) {
        delete this._hooks[name]
      }
    }
  }

  deprecateHook (name: string, deprecated: deprecatedHookT) {
    this._deprecatedHooks[name] = deprecated
  }

  deprecateHooks (deprecatedHooks: deprecatedHooksT) {
    Object.assign(this._deprecatedHooks, deprecatedHooks)
  }

  addHooks (configHooks: configHooksT) {
    const hooks = flatHooks(configHooks)
    const removeFns = Object.keys(hooks).map(key => this.hook(key, hooks[key]))

    return () => {
      // Splice will ensure that all fns are called once, and free all
      // unreg functions from memory.
      removeFns.splice(0, removeFns.length).forEach(unreg => unreg())
    }
  }

  removeHooks (configHooks: configHooksT) {
    const hooks = flatHooks(configHooks)
    for (const key in hooks) {
      this.removeHook(key, hooks[key])
    }
  }

  async callHook (name: string, ...args: any) {
    const tasks = this._hooks[name];
    if (!tasks) return;
    try {
      const results = await serial(tasks, fn => fn(...args));
      if(isObject(results)) return results;
      return results?.[0];
    } catch (err) {
      if (name !== 'error') {
        await this.callHook('error', err)
      }
      if (this._logger) {
        if (this._logger.fatal) {
          this._logger.fatal(err)
        } else {
          this._logger.error(err)
        }
      }
    }
  }

  async callParallelHook (name: string, ...args: any) {
    const tasks = this._hooks[name];
    if (!tasks) return;
    try {
      const results = await Promise.all(
        tasks.map((fn: hookFnT)=>fn(...args))
      )
      return results?.[0];
    } catch (err) {
      if (name !== 'error') {
        await this.callHook('error', err)
      }
      if (this._logger) {
        if (this._logger.fatal) {
          this._logger.fatal(err)
        } else {
          this._logger.error(err)
        }
      }
    }
  }
}

Servable.mergeHooks = mergeHooks
Servable.prototype.mergeHooks = mergeHooks

export default Servable
