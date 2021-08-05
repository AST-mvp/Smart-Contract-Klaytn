import HttpException from "@src/exceptions/HttpException";
import { Router } from "express";
import expressAsyncHandler from "express-async-handler";
import authRequired from "../middleware/authRequired";

const route = Router();

const users = (app: Router) => {
  app.use("/users", route);

  route.get(
    "/me",
    authRequired,
    expressAsyncHandler(async (req, res) => {
      if (!req.user) throw new HttpException(401);
      res.json(req.user);
    })
  );
};

export default users;
