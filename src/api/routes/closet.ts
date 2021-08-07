import HttpException from "@src/exceptions/HttpException";
import ClosetService from "@src/services/closet";
import { Router } from "express";
import expressAsyncHandler from "express-async-handler";
import Container from "typedi";
import authRequired from "../middleware/authRequired";

const route = Router();

const closet = (app: Router) => {
  app.use("/closet", authRequired, route);

  route.get(
    "/",
    expressAsyncHandler(async (req, res) => {
      if (!req.user) throw new HttpException(401);
      const closetService = Container.get(ClosetService);
      res.json(await closetService.fetchUsersCloset(req.user.id));
    })
  );
};

export default closet;
