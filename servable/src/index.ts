
export type servableFn = (...args: any) => Promise<any> | void;

export interface servableSet {
  [name: string]: servableFn[]
}

export function serial<T> (tasks: T[], fn: (task: T) => Promise<any> | any) {
  return tasks.reduce((promise, task) => promise.then(async () => fn(task)), Promise.resolve(null))
}

export default class Servable {
  private subscribers: servableSet = {};

  constructor(){
    this.subscribers = {}
  }

  // 检查是否已订阅
  hasSubscribe(type: string): boolean{
    return Boolean(this.subscribers[type]?.[0]);
  }

  subscribe(type: string, fn: servableFn) {
    if (!type || typeof fn !== 'function') {
      return () => {}
    }
    this.subscribers[type] = this.subscribers[type] || [];
    this.subscribers[type].push(fn);
  
    return () => {
      if (fn) {
        this.unsubscribe(type, fn)
        fn = null // Free memory
      }
    }
  }

  unsubscribe(type: string, fn: servableFn) {
    if (this.subscribers[type]) {
      const index = this.subscribers[type].indexOf(fn)

      if (index !== -1) {
        this.subscribers[type].splice(index, 1)
      }

      if (this.subscribers[type].length === 0) {
        delete this.subscribers[type]
      }
    }
  }

  async dispacth(type: string, payload?:any, isSerial?: boolean) {
    if (!this.subscribers[type]) {
      return
    }

    let results = [];
    const tasks = this.subscribers[type];

    if(isSerial){
      // 串行执行，直至最后一个
      await serial(tasks, async (fn: servableFn) => results.push(await fn(payload)) )
    }

    // 默认为并行执行
    results = await Promise.all(
      tasks.map((fn: servableFn)=>fn(payload))
    )

    return results;
  }

}
