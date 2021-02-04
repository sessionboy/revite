import { parse } from "es-module-lexer"
import stripComments from 'strip-comments';

export function matchDynamicImportValue(importStatement: string) {
  const matched = stripComments(importStatement).match(/^\s*('([^']+)'|"([^"]+)")\s*$/m);
  return matched?.[2] || matched?.[3] || null;
}

export const scanCodeImportsExports = async (code: string): Promise<any[]> => {
  const [imports] = await parse(code);
  return imports.filter((imp: any) => {
    //imp.d = -2 = import.meta.url = we can skip this for now
    if (imp.d === -2) {
      return false;
    }
    // imp.d > -1 === dynamic import
    if (imp.d > -1) {
      const importStatement = code.substring(imp.s, imp.e);
      return !!matchDynamicImportValue(importStatement);
    }
    return true;
  });
}