import { CacheProvider } from "@emotion/react";
import { CssBaseline } from "@mui/material";
import Cookies from "js-cookie";
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import createEmotionCache from "../createEmotionCache";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

const cache = createEmotionCache();

const Main: React.FC = () => {
  return (
    <CacheProvider value={cache}>
      <BrowserRouter>
        <CssBaseline />
        <App darkMode={Cookies.get("darkMode") === "true"} />
      </BrowserRouter>
    </CacheProvider>
  );
};

ReactDOM.hydrate(
  <React.StrictMode>
    <Main />
  </React.StrictMode>,
  document.getElementById("root"),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);
