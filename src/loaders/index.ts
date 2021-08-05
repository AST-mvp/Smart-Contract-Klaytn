import express from "express";
import Container from "typedi";
import expressLoader from "./express";
import sequelizeLoader from "./sequelize";

const loaders = async ({ expressApp }: { expressApp: express.Application }) => {
  expressLoader({
    app: expressApp,
  });
  Container.set("sequelize", sequelizeLoader());
};

export default loaders;
