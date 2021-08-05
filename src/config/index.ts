import dotenv from "dotenv";

dotenv.config();
process.env.NODE_ENV = process.env.NODE_ENV || "production";

const config = {
  port: process.env.PORT || 5000,
  jwtToken: process.env.JWT_TOKEN || "",
};

if (!config.jwtToken) throw new Error("JWT_TOKEN is not provided");

export default config;
