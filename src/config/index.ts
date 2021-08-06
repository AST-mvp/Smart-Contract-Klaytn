import dotenv from "dotenv";

dotenv.config();
process.env.NODE_ENV = process.env.NODE_ENV || "production";

const config = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || "",
  db: process.env.POSTGRESQL_DB || "",
};

if (!config.jwtSecret) throw new Error("JWT_SECRET is not provided");
if (!config.db) throw new Error("POSTGRESQL_DB is not provided");

export default config;
