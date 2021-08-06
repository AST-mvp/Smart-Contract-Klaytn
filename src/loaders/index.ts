import express from "express";
import expressLoader from "./express";
import modelsLoader from "./models";
import sequelize from "./sequelize";

const loaders = async ({ expressApp }: { expressApp: express.Application }) => {
  expressLoader({
    app: expressApp,
  });
  modelsLoader();
  sequelize.sync();
};

export default loaders;
