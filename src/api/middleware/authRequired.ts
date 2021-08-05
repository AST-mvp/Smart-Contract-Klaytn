import config from "@src/config";
import HttpException from "@src/exceptions/HttpException";
import { User } from "@src/types";
import { NextFunction, Request, Response } from "express";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

const authRequired = (req: Request, res: Response, next: NextFunction) => {
  if (!req.token) return next(new HttpException(401));
  try {
    req.user = jwt.verify(req.token, config.jwtToken) as User;
  } catch (e) {
    if (e instanceof JsonWebTokenError || e instanceof TokenExpiredError) {
      return next(new HttpException(401));
    }
    return next(new HttpException(500));
  }
  if (!req.user) return next(new HttpException(401));
  next();
};

export default authRequired;
