import { handleRoutes } from "./handleRoutes.js";
import { ReviteContext } from "./context.js"

export const ensureReady = async(callback: Function)=> {
  const revite = (window as any).__REVITE_DATA__||{};
  const routesPath = revite.routesPath||"/client/routes.js";

  let { default: _routes =[], Loading } = await import(routesPath).catch();
  const { routesData, store } = revite;

  const routes = await handleRoutes({
    routes: _routes,
    pathname: window.location.pathname,
    Loading,
    routesData
  });

  console.log("routes",routes);
  const context: ReviteContext = {
    routes,
    routesData,
    store
  }
  callback(context);
}
