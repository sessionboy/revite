import { InternalConfig } from "@revite/types"

export class BuildGraph {
  private urlMaps = new Map<string, Module>();
  private idMaps = new Map<string, Module>();
  private config: InternalConfig;

  constructor(config: InternalConfig){
    this.config = config;
  }

  getModuleFromUrl(url: string){
    this.urlMaps.get(url);
  }

  set(module: Module){
    
  }

}

export class Module {
  url: string
  id?: string
  file?: string
  type: 'js' | 'css'
  importers = new Set<Module>()
  importedModules = new Set<Module>()
  constructor(url: string) {
    this.url = url
    this.type ='js'
  }
}

