import morgan from "@src/api/middleware/morgan";
import express from "express";

const expressLoader = ({ app }: { app: express.Application }) => {
  app
    .route("/status")
    .get((req, res) => res.sendStatus(204))
    .head((req, res) => res.sendStatus(204));
  app.use(morgan);
};

export default expressLoader;
