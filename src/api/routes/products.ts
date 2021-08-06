import { Router } from "express";
import authRequired from "../middleware/authRequired";

const route = Router();

const products = (app: Router) => {
  app.use("/products", authRequired, route);
};

export default products;
