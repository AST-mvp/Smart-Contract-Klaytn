import { Router } from "express";
import auth from "./routes/auth";
import products from "./routes/products";
import users from "./routes/users";

const api = () => {
  const router = Router();
  auth(router);
  products(router);
  users(router);
  return router;
};

export default api;
