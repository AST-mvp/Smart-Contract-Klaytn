import HttpException from '@src/exceptions/HttpException';
import Product from '@src/model/Product';
import ProductsService, {
  DropType,
  DropTypeValues,
} from '@src/services/products';
import { celebrate, Joi } from 'celebrate';
import { Router } from 'express';
import expressAsyncHandler from 'express-async-handler';
import Container from 'typedi';
import authRequired from '../middleware/authRequired';

const route = Router();

const drops = (app: Router) => {
  app.use('/drops', authRequired, route);

  route.get<
    never,
    Product[],
    never,
    {
      type: DropType;
    }
  >(
    '/',
    celebrate({
      query: {
        type: Joi.string()
          .valid(...DropTypeValues)
          .required(),
      },
    }),
    expressAsyncHandler(async (req, res) => {
      if (!req.user) throw new HttpException(401);
      const productsService = Container.get(ProductsService);
      const products = await productsService.fetchAllProducts();
      res.json(products);
    }),
  );
};

export default drops;
