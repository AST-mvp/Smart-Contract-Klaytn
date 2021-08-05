import morgan from "@src/api/middleware/morgan";
import HttpException from "@src/exceptions/HttpException";
import express, { Request, Response, NextFunction } from "express";

const expressLoader = ({ app }: { app: express.Application }) => {
  app
    .route("/status")
    .get((req, res) => res.sendStatus(204))
    .head((req, res) => res.sendStatus(204));
  app.use(morgan);
  app.use(express.json());
  app.use(
    (err: HttpException, req: Request, res: Response, next: NextFunction) => {
      res.status(err.status ?? 500).json({
        message: err.message,
      });
    }
  );
};

export default expressLoader;
