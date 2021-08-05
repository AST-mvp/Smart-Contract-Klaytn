import dotenv from "dotenv";

dotenv.config();
process.env.NODE_ENV = process.env.NODE_ENV || "production";

const config = {
  port: process.env.PORT || 5000,
};

export default config;
