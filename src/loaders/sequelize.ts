import config from "@src/config";
import { Sequelize } from "sequelize";
import { dbLogger } from "./logger";

const sequelizeLoader = () => {
  const sequelize = new Sequelize(config.db, {
    logging: (sql, timing: any) =>
      dbLogger.debug(sql, timing.instance?.dataValues),
  });
  return sequelize;
};

export default sequelizeLoader;
