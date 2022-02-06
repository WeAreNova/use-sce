import cookieParser from "cookie-parser";
import express from "express";
import morgan from "morgan";
import getData from "./utils/getData";
import renderApp from "./utils/renderApp";

const server = express()
  .disable("x-powered-by")
  .use(morgan("dev"))
  .use(express.static(process.env.RAZZLE_PUBLIC_DIR!))
  .use(cookieParser())
  .get("/api/data", (_req, res) => {
    const data = getData();
    res.status(200).send(data);
  })
  .get("/*", async (req, res) => {
    try {
      const html = await renderApp(req, res);
      res.status(200).send(html);
    } catch (error) {
      console.error(error);
      res.status(500).send(error);
    }
  });

export default server;
