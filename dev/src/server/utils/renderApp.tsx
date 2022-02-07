import { CacheProvider } from "@emotion/react";
import createEmotionServer from "@emotion/server/create-instance";
import { CssBaseline } from "@mui/material";
import { collectData, extractData } from "@wearenova/use-sse/server";
import App from "client/App";
import createEmotionCache from "createEmotionCache";
import type Express from "express";
import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST!) as {
  [entrypoint: string]: { css?: string[]; js?: string[] };
};

const cssLinksFromAssets = (entrypoint: string) =>
  assets[entrypoint]?.css?.map((asset) => `<link rel="stylesheet" href="${asset}">`).join("") ?? "";

const jsScriptTagsFromAssets = (entrypoint: string, ...extra: string[]) =>
  assets[entrypoint]?.js?.map((asset) => `<script src="${asset}" ${extra.join(" ")}></script>`).join("") ?? "";

const renderApp = async (req: Express.Request, res: Express.Response) => {
  const cache = createEmotionCache();
  const { extractCriticalToChunks, constructStyleTagsFromChunks } = createEmotionServer(cache);

  const chunks = extractCriticalToChunks(
      renderToString(
        await collectData(
          <CacheProvider value={cache}>
            <StaticRouter location={req.url}>
              <CssBaseline />
              <App darkMode={req.cookies.darkMode === "true"} />
            </StaticRouter>
          </CacheProvider>,
        ),
      ),
    ),
    css = constructStyleTagsFromChunks(chunks),
    data = extractData();
  return `
    <!doctype html>
    <html lang="en-GB">
      <head>
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta charset="utf-8" />
          <title>UseSSE Development</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          ${css}
          ${cssLinksFromAssets("client")}
      </head>
      <body>
          <div id="root">${chunks.html}</div>
          ${jsScriptTagsFromAssets("client", "defer", "crossorigin")}
          <script> window.__PRELOADED_STATE__ = ${JSON.stringify(data)} </script>
      </body>
    </html>
`;
};

export default renderApp;
