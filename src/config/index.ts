import dotenv from "dotenv";

dotenv.config();
process.env.NODE_ENV = process.env.NODE_ENV || "production";

const config = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || "",
};

if (!config.jwtSecret) throw new Error("JWT_SECRET is not provided");

export default config;
