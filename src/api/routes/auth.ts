import { Router } from "express";

const route = Router();

const auth = (app: Router) => {
  app.use("/auth", route);
};

export default auth;
