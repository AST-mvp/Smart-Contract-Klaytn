import config from "@src/config";
import { Sequelize } from "sequelize";
import { dbLogger } from "./logger";

const sequelize = new Sequelize(config.db, {
  logging: (sql, timing: any) =>
    dbLogger.debug(sql, timing.instance?.dataValues),
});

export default sequelize;
