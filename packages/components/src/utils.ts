import { matchRoutes } from './imports.js'

export const matchCurrentRoutes = async (routes: any[], path: string)=>{
  const matchs = matchRoutes(routes, path)||[];
  console.log("matchs", matchs);
  return matchs;
  // return Promise.all(
  //   matchs.map(async match=>{
  //     const route = match.route;
  //     // const { } = await route.
  //   })
  // )
}