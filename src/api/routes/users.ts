import HttpException from "@src/exceptions/HttpException";
import ProductsService from "@src/services/products";
import { Router } from "express";
import expressAsyncHandler from "express-async-handler";
import Container from "typedi";
import authRequired from "../middleware/authRequired";

const route = Router();

const users = (app: Router) => {
  app.use("/users", authRequired, route);

  route.get(
    "/me",
    expressAsyncHandler(async (req, res) => {
      if (!req.user) throw new HttpException(401);
      res.json(req.user);
    })
  );
};

export default users;
