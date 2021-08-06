import User, { UserAttributes } from "@src/model/User";
import { Inject, Service } from "typedi";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "@src/config";

@Service()
export default class AuthService {
  constructor(@Inject("models.users") private userModel: typeof User) {}

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
    const userData = user.toJSON() as UserAttributes;
    delete userData.pw;
    return jwt.sign(userData, config.jwtSecret);
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
      type: "email",
      email,
      pw: hash,
    });
    return true;
  }
}
