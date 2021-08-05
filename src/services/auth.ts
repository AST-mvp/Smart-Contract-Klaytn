import User from "@src/model/User";
import { Inject, Service } from "typedi";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import config from "@src/config";

@Service()
export default class AuthService {
  constructor(@Inject("model.users") private userModel: typeof User) {}

  /**
   * verify email and check password is correct
   * @returns weather user exist and correct password
   */
  public async verifyEmail(email: string, pw: string) {
    const user = await this.userModel.findOne({
      where: { type: "email", email },
    });
    if (!user?.pw) return false;
    return bcrypt.compare(pw, user.pw);
  }

  /**
   * generate jwt with email
   * @returns jwt if user exist or null
   */
  public async generateEmailJwt(email: string) {
    const user = await this.userModel.findOne({
      where: { type: "email", email },
    });
    if (!user) return null;
    return jwt.sign({ id: user.id, type: "email", email }, config.jwtSecret);
  }

  /**
   * register with email
   * @returns if email doesn't exist (successfully register)
   */
  public async registerEmail(email: string, pw: string) {
    const user = await this.userModel.findOne({
      where: { type: "email", email },
    });
    if (user) return false;
    const hash = await bcrypt.hash(pw, 10);
    await this.userModel.create({
      id: uuidv4(),
      type: "email",
      email,
      pw: hash,
    });
    return true;
  }
}
