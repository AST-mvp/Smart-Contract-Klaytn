import express from 'express';
import expressLoader from './express';
import firebaseLoader from './firebase';
import modelsLoader from './models';
import multerLoader from './multr';
import sequelize from './sequelize';

const loaders = async ({ expressApp }: { expressApp: express.Application }) => {
  multerLoader();
  expressLoader({
    app: expressApp,
  });
  modelsLoader();
  sequelize.sync();
  firebaseLoader();
};

export default loaders;
