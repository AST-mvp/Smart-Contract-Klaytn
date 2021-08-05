import express from "express";
import expressLoader from "./express";

const loaders = async ({ expressApp }: { expressApp: express.Application }) => {
  expressLoader({
    app: expressApp,
  });
};

export default loaders;
