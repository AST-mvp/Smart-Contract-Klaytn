import HttpException from "@src/exceptions/HttpException";
import logger from "@src/loaders/logger";
import AuthService from "@src/services/auth";
import { celebrate, Joi } from "celebrate";
import { Router } from "express";
import expressAsyncHandler from "express-async-handler";
import Container from "typedi";

const route = Router();

const auth = (app: Router) => {
  app.use("/auth", route);

  route.post<
    never,
    { message: string } | { token: string },
    {
      email: string;
      pw: string;
    }
  >(
    "/login",
    celebrate({
      body: {
        email: Joi.string().email().required(),
        pw: Joi.string().required(),
      },
    }),
    expressAsyncHandler(async (req, res) => {
      const { email, pw } = req.body;
      const authService = Container.get(AuthService);
      if (!(await authService.verifyEmail(email, pw)))
        throw new HttpException(404, "incorrect email or password");
      const token = await authService.generateEmailJwt(email);
      if (!token) throw new HttpException(500);
      res.json({ token });
    })
  );

  route.post<
    never,
    { message: string },
    {
      email: string;
      pw: string;
      nickname: string;
    }
  >(
    "/register",
    celebrate({
      body: {
        email: Joi.string().email().required(),
        pw: Joi.string().required(),
        nickname: Joi.string().max(256).required(),
      },
    }),
    expressAsyncHandler(async (req, res) => {
      const authService = Container.get(AuthService);
      if (!(await authService.registerEmail(req.body)))
        throw new HttpException(409, "email already exist");
      res.json({ message: "successfully registered" });
    })
  );

  route.post<
    never,
    { message: string } | { token: string },
    { accessToken: string }
  >(
    "/oauth/google",
    celebrate({ body: { accessToken: Joi.string().required() } }),
    expressAsyncHandler(async (req, res) => {
      const authService = Container.get(AuthService);
      const token = await authService.loginWithGoogle(req.body.accessToken);
      if (!token) throw new HttpException(500);
      res.json({ token });
    })
  );

  route.post<
    never,
    { message: string } | { token: string },
    { accessToken: string }
  >(
    "/oauth/kakao",
    celebrate({ body: { accessToken: Joi.string().required() } }),
    expressAsyncHandler(async (req, res) => {
      const authService = Container.get(AuthService);
      const token = await authService.loginWithKakao(req.body.accessToken);
      if (!token) throw new HttpException(500);
      res.json({ token });
    })
  );
};

export default auth;
