import JoiDateFactory from "@joi/date";
import HttpException from "@src/exceptions/HttpException";
import ProductsService from "@src/services/products";
import { Product } from "@src/types";
import { celebrate, Joi } from "celebrate";
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

  route.post<never, { message: string }, Omit<Product, "ownerID">>(
    "/",
    checkPermission("admin"),
    celebrate({
      body: {
        nfcID: Joi.number().required(),
        brandID: Joi.string().required(),
        productID: Joi.string().required(),
        editionID: Joi.string().required(),
        manufactureDate: Joi.extend(JoiDateFactory)
          .date()
          .format("YYYY-MM-DD")
          .required(),
        limited: Joi.boolean().required(),
        drop: Joi.boolean().default(false),
      },
    }),
    expressAsyncHandler(async (req, res) => {
      if (!req.user) throw new HttpException(401);
      const productsService = Container.get(ProductsService);
      if (
        !(await productsService.registerProduct({
          ...req.body,
          ownerID: req.user.id,
        }))
      )
        throw new HttpException(409, "nfcID already exists");
      res.json({ message: "successfully registered product" });
    })
  );

  route.get<{ nfcid: number }>(
    "/:nfcid",
    celebrate({ params: { nfcid: Joi.number().required() } }),
    expressAsyncHandler(async (req, res) => {
      const productsService = Container.get(ProductsService);
      const product = await productsService.fetchProductByNfcId(
        req.params.nfcid
      );
      if (!product) throw new HttpException(404, "product not found");
      res.json(product);
    })
  );

  route.post<
    never,
    { message: string },
    {
      nfcID: number;
      userID: string;
    }
  >(
    "/trade",
    celebrate({
      body: {
        nfcID: Joi.number().required(),
        userID: Joi.string().uuid().required(),
      },
    }),
    expressAsyncHandler(async (req, res) => {
      const productsService = Container.get(ProductsService);
      const { nfcID, userID } = req.body;
      if (userID === req.user?.id)
        throw new HttpException(400, "can't change ownership to yourself");
      const result = await productsService.changeOwnership(nfcID, userID);
      if (!result) throw new HttpException(404, "product not found");
      res.json({ message: "successfully transfered" });
    })
  );
};

export default products;
