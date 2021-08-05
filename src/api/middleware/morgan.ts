import { Request, Response } from "express";
import morgan from "morgan";
import chalk from "chalk";
import logger from "@src/loaders/logger";

const methodToColor = (method: string): typeof chalk.Color => {
  if (method === "GET") return "green";
  if (method === "POST") return "cyan";
  if (method === "PUT") return "yellow";
  if (method === "DELETE") return "red";
  return "white";
};

const statusCodeToColor = (statusCode: number): typeof chalk.Color => {
  if (statusCode < 300) return "green";
  if (statusCode < 400) return "cyan";
  if (statusCode < 500) return "yellow";
  if (statusCode < 600) return "red";
  return "white";
};

export default morgan
  .token<Request, Response>(
    "remote-addr",
    (req) =>
      (req.headers["x-real-ip"] as string) ||
      (req.headers["x-forwarded-for"] as string) ||
      (req.socket.remoteAddress as string)
  )
  .token("method", (req) => chalk[methodToColor(req.method)](req.method))
  .token("status", (_, res) =>
    chalk[statusCodeToColor(res.statusCode)](res.statusCode)
  )(
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :response-time ms :res[content-length]',
  {
    stream: {
      write: (message) => logger.http(message.trim(), { label: "morgan" }),
    },
  }
);
