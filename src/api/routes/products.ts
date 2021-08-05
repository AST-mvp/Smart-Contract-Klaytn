import HttpException from "@src/exceptions/HttpException";
import ProductsService from "@src/services/products";
import { Router } from "express";
import expressAsyncHandler from "express-async-handler";
import Container from "typedi";
import authRequired from "../middleware/authRequired";
import checkPermission from "../middleware/checkPermission";

const route = Router();

const products = (app: Router) => {
  app.use("/products", authRequired, route);

  route.get(
    "/",
    checkPermission("admin"),
    expressAsyncHandler(async (req, res) => {
      if (!req.user) throw new HttpException(401);
      const productsService = Container.get(ProductsService);
      res.json(await productsService.fetchAllProducts());
    })
  );
};

export default products;
