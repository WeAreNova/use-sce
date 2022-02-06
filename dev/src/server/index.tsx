import { CacheProvider } from "@emotion/react";
import createEmotionServer from "@emotion/server/create-instance";
import { CssBaseline } from "@mui/material";
import cookieParser from "cookie-parser";
import express from "express";
import faker from "faker";
import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import App from "../client/App";
import { Address, User, USER_ROLES } from "../client/utils";
import createEmotionCache from "../createEmotionCache";

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST!);

const cssLinksFromAssets = (assets: any, entrypoint: any) => {
  return assets[entrypoint]
    ? assets[entrypoint].css
      ? assets[entrypoint].css.map((asset) => `<link rel="stylesheet" href="${asset}">`).join("")
      : ""
    : "";
};

const jsScriptTagsFromAssets = (assets: any, entrypoint: any, ...extra: any[]) => {
  return assets[entrypoint]
    ? assets[entrypoint].js
      ? assets[entrypoint].js.map((asset) => `<script src="${asset}" ${extra.join(" ")}></script>`).join("")
      : ""
    : "";
};

export const renderApp = (req: express.Request, res: express.Response) => {
  const cache = createEmotionCache();
  const { extractCriticalToChunks, constructStyleTagsFromChunks } = createEmotionServer(cache);

  const markup = renderToString(
    <CacheProvider value={cache}>
      <StaticRouter location={req.url}>
        <CssBaseline />
        <App darkMode={req.cookies.darkMode === "true"} />
      </StaticRouter>
    </CacheProvider>,
  );
  const chunks = extractCriticalToChunks(markup),
    css = constructStyleTagsFromChunks(chunks);

  const html = `<!doctype html>
  <html lang="">
  <head>
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta charset="utf-8" />
      <title>Welcome to Razzle</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      ${css}
      ${cssLinksFromAssets(assets, "client")}
  </head>
  <body>
      <div id="root">${markup}</div>
      ${jsScriptTagsFromAssets(assets, "client", "defer", "crossorigin")}
  </body>
</html>`;
  return { html };
};

const server = express();
server
  .disable("x-powered-by")
  .use(express.static(process.env.RAZZLE_PUBLIC_DIR!))
  .use(cookieParser())
  .get("/api/data", (_req, res) => {
    const data = faker.datatype.array(faker.datatype.number({ min: 10, max: 100 })).flatMap<User>(() => {
      const totalBalance = faker.datatype.number({ min: 0, max: 10000000 });
      const investedBalance = faker.datatype.number({ min: 0, max: totalBalance });
      const registrationDate = faker.date.past();
      return {
        id: faker.datatype.uuid(),
        email: faker.internet.email(),
        title: faker.name.prefix(),
        forenames: faker.name.firstName(),
        surname: faker.name.lastName(),
        password: faker.internet.password(),
        isConfirmed: faker.datatype.boolean(),
        registrationDate,
        registrationDateFormatted: registrationDate.toLocaleDateString(),
        role: faker.random.arrayElement(USER_ROLES),
        personalDetails: !faker.datatype.boolean()
          ? undefined
          : {
              dob: faker.date.past(),
              contactNumber: faker.phone.phoneNumber(),
              addressHistory: faker.datatype.array(faker.datatype.number({ min: 1, max: 3 })).map<Address>(() => ({
                addressLineOne: faker.address.streetAddress(),
                addressLineTwo: faker.address.secondaryAddress(),
                city: faker.address.city(),
                country: faker.address.country(),
                postcode: faker.address.zipCode(),
                lengthYears: faker.datatype.number({ min: 1, max: 10 }),
                lengthMonths: faker.datatype.number({ min: 1, max: 12 }),
              })),
            },
        balances: {
          total: totalBalance,
          invested: investedBalance,
          available: totalBalance - investedBalance,
        },
      };
    });
    res.status(200).send(data);
  })
  .get("/*", (req, res) => {
    const { html } = renderApp(req, res);
    res.status(200).send(html);
  });

export default server;
