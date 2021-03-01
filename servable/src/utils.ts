import { configHooksT, flatHooksT } from './types.js'

export function isObject(value: unknown): value is Record<string, any> {
  return Object.prototype.toString.call(value) === '[object Object]'
}

export function flatHooks (configHooks: configHooksT, hooks: flatHooksT = {}, parentName?: string): flatHooksT {
  for (const key in configHooks) {
    const subHook = configHooks[key]
    const name = parentName ? `${parentName}:${key}` : key
    if (typeof subHook === 'object' && subHook !== null) {
      flatHooks(subHook, hooks, name)
    } else if (typeof subHook === 'function') {
      hooks[name] = subHook
    }
  }
  return hooks
}

export function mergeHooks (...hooks: configHooksT[]): flatHooksT {
  const finalHooks: any = {}

  for (let _hook of hooks) {
    _hook = flatHooks(_hook)
    for (const key in _hook) {
      if (finalHooks[key]) {
        finalHooks[key].push(_hook[key])
      } else {
        finalHooks[key] = [_hook[key]]
      }
    }
  }

  for (const key in finalHooks) {
    const arr = finalHooks[key]
    finalHooks[key] = (...args:any) => serial(arr, (fn: any) => fn(...args))
  }

  return finalHooks
}

export function serial<T> (tasks: T[], fn: (task: T) => Promise<any> | any) {
  return tasks.reduce((promise, task) => promise.then(() => fn(task)), Promise.resolve(null))
}
