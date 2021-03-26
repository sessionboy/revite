
// const root = "./.revite/client";

// const routes = await import(`./.revite/client/routes.js`);
// const App = await import(`./.revite/client/src/App.jsx`);
// const index = await import(`./.revite/client/index.mjs`);

// console.log(routes.default);
// console.log(App.default);

const test = await import(`http://localhost:3000/src/App.jsx`);
console.log(test);