import { RequestHandler } from "express";
import { ParamsDictionary } from "express-serve-static-core";

declare module "express-async-handler" {
  declare function expressAsyncHandler<
    P = ParamsDictionary,
    ResBody = any,
    ReqBody = any,
    ReqQuery = core.Query
  >(
    handler: (
      ...args: Parameters<RequestHandler<P, ResBody, ReqBody, ReqQuery>>
    ) => void | Promise<void>
  ): RequestHandler<P, ResBody, ReqBody, ReqQuery>;
  export default expressAsyncHandler;
}
