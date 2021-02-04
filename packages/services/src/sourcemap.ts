import { ExistingRawSourceMap } from 'rollup'
import { RawSourceMap } from 'source-map'
import { createRequire } from "module"
const require = createRequire(import.meta.url);
const merge = require('merge-source-map')

export interface IRawSourceMap extends RawSourceMap {
  version: any
}
export interface IExistingRawSourceMap extends ExistingRawSourceMap {
  version: any
}
export type SourceMap = IExistingRawSourceMap | IRawSourceMap

export function mergeSourceMap(
  oldMap: SourceMap | null | undefined,
  newMap: SourceMap
): SourceMap {
  if (!oldMap) {
    return newMap
  }
  // merge-source-map will overwrite original sources if newMap also has
  // sourcesContent
  newMap.sourcesContent = []
  return merge(oldMap, newMap) as SourceMap
}

export function genSourceMapString(map: SourceMap | string | undefined) {
  if (typeof map !== 'string') {
    map = JSON.stringify(map)
  }
  return `\n//# sourceMappingURL=data:application/json;base64,${Buffer.from(
    map
  ).toString('base64')}`
}