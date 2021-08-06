import { UserAttributes } from "@src/model/User";

declare global {
  namespace Express {
    interface Request {
      user?: Omit<UserAttributes, "pw">;
    }
  }
}
