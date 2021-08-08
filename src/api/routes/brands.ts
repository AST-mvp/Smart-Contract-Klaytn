import HttpException from "@src/exceptions/HttpException";
import { BrandAttributes, BrandCreationAttributes } from "@src/model/Brand";
import BrandsService from "@src/services/brands";
import { celebrate, Joi } from "celebrate";
import { Router } from "express";
import expressAsyncHandler from "express-async-handler";
import Container from "typedi";
import authRequired from "../middleware/authRequired";
import checkPermission from "../middleware/checkPermission";

const route = Router();

const brands = (app: Router) => {
  app.use("/brands", authRequired, route);

  route.get(
    "/",
    checkPermission("admin"),
    expressAsyncHandler(async (req, res) => {
      const brandsService = Container.get(BrandsService);
      res.json(await brandsService.fetchAllBrands());
    })
  );

  route.post<never, BrandAttributes, BrandCreationAttributes>(
    "/",
    checkPermission("admin"),
    celebrate({
      body: {
        name: Joi.string().max(256).required(),
      },
    }),
    expressAsyncHandler(async (req, res) => {
      const brandsService = Container.get(BrandsService);
      res.json(await brandsService.addNewBrand(req.body));
    })
  );

  route.get<{ brandId: string }>(
    "/:brandId",
    celebrate({ params: { brandId: Joi.string().uuid().required() } }),
    expressAsyncHandler(async (req, res) => {
      const brandsService = Container.get(BrandsService);
      const brand = await brandsService.fetchBrandById(req.params.brandId);
      if (!brand) throw new HttpException(404, "product not found");
      res.json(brand);
    })
  );
};

export default brands;
