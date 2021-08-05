import "reflect-metadata";
import express from "express";
import config from "./config";
import loaders from "./loaders";
import logger from "./loaders/logger";

async function startServer() {
  const app = express();
  loaders({ expressApp: app });
  app.listen(config.port, () => {
    logger.info(`
################################################
      🛡️  Server listening on port: ${config.port} 🛡️
################################################
    `);
  });
}

startServer();
