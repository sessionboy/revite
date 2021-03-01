import React,{ Suspense } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from "react-router-dom"
import App from './App';
import { HeadManager } from "./head/index"
import "./index.css"

const Loading = () =>(<div>loading...</div>);

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <HeadManager>
        <Suspense fallback={<Loading />}>
          <App />
        </Suspense>
      </HeadManager>     
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root'),
);

if (import.meta.hot) {
  import.meta.hot.accept();
}

