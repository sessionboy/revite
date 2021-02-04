
const root = "./.revite/client";

const routes = await import(`./.revite/client/routes.js`);
const App = await import(`./.revite/client/App.js`);
// const index = await import(`./.revite/client/index.mjs`);

console.log(routes.default);
console.log(App.default);