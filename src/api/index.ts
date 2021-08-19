import { Router } from 'express';
import auth from './routes/auth';
import brands from './routes/brands';
import closet from './routes/closet';
import files from './routes/files';
import nfcs from './routes/nfcs';
import products from './routes/products';
import users from './routes/users';

const api = () => {
  const router = Router();
  auth(router);
  brands(router);
  closet(router);
  files(router);
  nfcs(router);
  products(router);
  users(router);
  return router;
};

export default api;
