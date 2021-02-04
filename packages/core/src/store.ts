
export interface ModuleNode {
  id: string
  fileExt: string
  outputPath: string
  outputExt: string
  relativePath: string
}

export type id = string;

export type ModuleStore = Map<id, ModuleNode>;
