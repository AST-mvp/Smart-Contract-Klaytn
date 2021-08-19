import fetch from "node-fetch";
import User, { UserAttributes, UserCreationAttributes } from "@src/model/User";
import { Inject, Service } from "typedi";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "@src/config";

interface GoogleUserInfo {
  picture: string;
  name: string;
  locale: string;
  email: string;
  given_name: string;
  id: string;
  verified_email: boolean;
}

interface KakaoUserInfo {
  id: number;
  properties: {
    nickname: string;
  };
}

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
      attributes: { exclude: ["pw"] },
      raw: true,
    });
    if (!user) return null;
    return jwt.sign({ id: user.id }, config.jwtSecret);
  }

  /**
   * register with email
   * @returns if email doesn't exist (successfully register)
   */
  public async registerEmail({
    email,
    pw,
    nickname,
  }: Required<Pick<UserCreationAttributes, "email" | "pw" | "nickname">>) {
    const user = await this.userModel.findOne({
      where: { type: "email", email },
    });
    if (user) return false;
    const hash = await bcrypt.hash(pw, 10);
    await this.userModel.create({
      type: "email",
      email,
      nickname,
      pw: hash,
    });
    return true;
  }

  public async fetchUserByPk(userId: string) {
    const userData = (await this.userModel.findByPk(userId, {
      attributes: { exclude: ["pw"] },
    })) as Omit<UserAttributes, "pw">;
    return userData;
  }

  private async fetchGoogleUserInformation(
    accessToken: string
  ): Promise<GoogleUserInfo> {
    return (
      await fetch(
        `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
      )
    ).json();
  }

  /**
   * login using google oauth access token
   * @returns jwt. if fail fetch user information, return null.
   */
  public async loginWithGoogle(accessToken: string) {
    const userInfo = await this.fetchGoogleUserInformation(accessToken);
    if (!userInfo.id) return null;
    const [userData] = await this.userModel.findCreateFind({
      where: { type: "google", oauthId: userInfo.id },
      defaults: {
        type: "google",
        nickname: userInfo.given_name,
        email: userInfo.email,
      },
    });
    return jwt.sign({ id: userData.id }, config.jwtSecret);
  }

  private async fetchKakaoUserInformation(
    accessToken: string
  ): Promise<KakaoUserInfo> {
    return (
      await fetch(`https://kapi.kakao.com/v2/user/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
    ).json();
  }

  public async loginWithKakao(accessToken: string) {
    const userInfo = await this.fetchKakaoUserInformation(accessToken);
    if (!userInfo.id) return null;
    const [userData] = await this.userModel.findCreateFind({
      where: { type: "kakao", oauthId: userInfo.id.toString() },
      defaults: {
        type: "kakao",
        nickname: userInfo.properties.nickname,
      },
    });
    return jwt.sign({ id: userData.id }, config.jwtSecret);
  }
}
