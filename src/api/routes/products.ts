import HttpException from '@src/exceptions/HttpException';
import {
  ProductAttributes,
  ProductCreationAttributes,
} from '@src/model/Product';
import ProductsService from '@src/services/products';
import { celebrate, Joi } from 'celebrate';
import { Router } from 'express';
import expressAsyncHandler from 'express-async-handler';
import Container from 'typedi';
import authRequired from '../middleware/authRequired';
import checkPermission from '../middleware/checkPermission';

const route = Router();

const products = (app: Router) => {
  app.use('/products', authRequired, route);

  route.get(
    '/',
    checkPermission('admin'),
    expressAsyncHandler(async (req, res) => {
      const productsService = Container.get(ProductsService);
      res.json(await productsService.fetchAllProducts());
    }),
  );

  route.post<never, ProductAttributes, ProductCreationAttributes>(
    '/',
    checkPermission('admin'),
    celebrate({
      body: {
        kind: Joi.string().max(256).required(),
        name: Joi.string().max(256).required(),
        brandId: Joi.string().uuid().required(),
        filename: Joi.string().max(256).required(),
      },
    }),
    expressAsyncHandler(async (req, res) => {
      const productsService = Container.get(ProductsService);
      res.json(await productsService.addNewProduct(req.body));
    }),
  );

  route.get<{ productId: string }>(
    '/:productId',
    celebrate({ params: { productId: Joi.string().uuid().required() } }),
    expressAsyncHandler(async (req, res) => {
      const productsService = Container.get(ProductsService);
      const product = await productsService.fetchProductById(
        req.params.productId,
      );
      if (!product) throw new HttpException(404, 'product not found');
      res.json(product);
    }),
  );
};

export default products;
