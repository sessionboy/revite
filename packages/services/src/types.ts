import Resolver from "./resolver/index.js" 

export interface ResolverOptions {
  root: string
  resolvers?: Resolver[]
  userAlias?: Record<string, string>
  assetsInclude?: (file: string) => boolean
}