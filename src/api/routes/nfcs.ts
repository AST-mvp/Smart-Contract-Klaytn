import JoiDateFactory from "@joi/date";
import HttpException from "@src/exceptions/HttpException";
import { NfcAttributes, NfcCreationAttributes } from "@src/model/Nfc";
import NfcsService from "@src/services/nfcs";
import { celebrate, Joi } from "celebrate";
import { Router } from "express";
import expressAsyncHandler from "express-async-handler";
import Container from "typedi";
import authRequired from "../middleware/authRequired";
import checkPermission from "../middleware/checkPermission";

const route = Router();

const nfcs = (app: Router) => {
  app.use("/nfcs", authRequired, route);

  route.get(
    "/",
    checkPermission("admin"),
    expressAsyncHandler(async (req, res) => {
      if (!req.user) throw new HttpException(401);
      const nfcsService = Container.get(NfcsService);
      res.json(await nfcsService.fetchAllNfcs());
    })
  );

  route.post<never, NfcAttributes, Omit<NfcCreationAttributes, "ownerID">>(
    "/",
    checkPermission("admin"),
    celebrate({
      body: {
        productId: Joi.string().required(),
        editionNo: Joi.number(),
        manufactureDate: Joi.extend(JoiDateFactory)
          .date()
          .format("YYYY-MM-DD")
          .required(),
        dropStartAt: Joi.date().required(),
        dropEndAt: Joi.date().required(),
      },
    }),
    expressAsyncHandler(async (req, res) => {
      if (!req.user) throw new HttpException(401);
      const nfcsService = Container.get(NfcsService);
      const nfcData = await nfcsService.registerNfc({
        ...req.body,
        ownerId: req.user.id,
      });
      if (!nfcData) throw new HttpException(404, "productId doesn't exist");
      res.json(nfcData);
    })
  );

  route.get<{ nfcId: string }>(
    "/:nfcId",
    celebrate({ params: { nfcId: Joi.string().uuid().required() } }),
    expressAsyncHandler(async (req, res) => {
      const nfcsService = Container.get(NfcsService);
      const nfc = await nfcsService.fetchProductByNfcId(req.params.nfcId);
      if (!nfc) throw new HttpException(404, "product not found");
      res.json(nfc);
    })
  );

  route.post<
    never,
    { message: string },
    {
      nfcId: number;
      userId: string;
    }
  >(
    "/trade",
    celebrate({
      body: {
        nfcId: Joi.number().required(),
        userId: Joi.string().uuid().required(),
      },
    }),
    expressAsyncHandler(async (req, res) => {
      const nfcsService = Container.get(NfcsService);
      const { nfcId, userId } = req.body;
      if (userId === req.user?.id)
        throw new HttpException(400, "can't change ownership to yourself");
      const result = await nfcsService.changeOwnership(nfcId, userId);
      if (!result) throw new HttpException(404, "nfc not found");
      res.json({ message: "successfully transfered" });
    })
  );
};

export default nfcs;
