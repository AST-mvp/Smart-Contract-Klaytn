import express from "express";
import expressLoader from "./express";
import modelsLoader from "./models";

const loaders = async ({ expressApp }: { expressApp: express.Application }) => {
  expressLoader({
    app: expressApp,
  });
  modelsLoader();
};

export default loaders;
