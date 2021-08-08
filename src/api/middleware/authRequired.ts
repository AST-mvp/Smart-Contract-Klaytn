import config from "@src/config";
import HttpException from "@src/exceptions/HttpException";
import AuthService from "@src/services/auth";
import expressAsyncHandler from "express-async-handler";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import Container from "typedi";

const authRequired = expressAsyncHandler(async (req, res, next) => {
  if (!req.token) throw new HttpException(401);
  try {
    const { id: userId } = jwt.verify(req.token, config.jwtSecret) as {
      id: string;
    };
    const authService = Container.get(AuthService);
    const userData = await authService.fetchUserByPk(userId);
    req.user = userData;
  } catch (e) {
    if (e instanceof JsonWebTokenError || e instanceof TokenExpiredError) {
      throw new HttpException(401);
    }
    throw new HttpException(500);
  }
  if (!req.user) throw new HttpException(401);
  next();
});

export default authRequired;
