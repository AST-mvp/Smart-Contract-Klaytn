import { Router } from "express";
import auth from "./routes/auth";
import nfcs from "./routes/nfcs";
import products from "./routes/products";
import users from "./routes/users";

const api = () => {
  const router = Router();
  auth(router);
  nfcs(router);
  products(router);
  users(router);
  return router;
};

export default api;
