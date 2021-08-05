import HttpException from "@src/exceptions/HttpException";
import { UserAttributes } from "@src/model/User";
import { NextFunction, Request, Response } from "express";

const checkPermission =
  (...permissions: UserAttributes["permission"]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    if (!user) return next(new HttpException(401));
    if (
      !permissions.every((permission) => user.permission.includes(permission))
    )
      return next(new HttpException(404));
    next();
  };
export default checkPermission;
