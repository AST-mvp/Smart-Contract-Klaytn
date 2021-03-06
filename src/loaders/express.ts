import api from "@src/api";
import morgan from "@src/api/middleware/morgan";
import HttpException from "@src/exceptions/HttpException";
import { errors } from "celebrate";
import express, { Request, Response, NextFunction } from "express";
import bearerToken from "express-bearer-token";
import logger from "./logger";

const expressLoader = ({ app }: { app: express.Application }) => {
  app
    .route("/status")
    .get((req, res) => res.sendStatus(204))
    .head((req, res) => res.sendStatus(204));
  app.use(morgan);
  app.use(bearerToken());
  app.use(express.json());
  app.use(api());
  app.use(errors());
  app.use(() => {
    throw new HttpException(404);
  });
  app.use(
    (err: HttpException, req: Request, res: Response, next: NextFunction) => {
      logger.error(err.stack);
      res.status(err.status ?? 500).json({
        message: err.message,
      });
    }
  );
};

export default expressLoader;
