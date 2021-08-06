import User from "@src/model/User";
import Container from "typedi";

const modelsLoader = () => {
  [User].forEach((model) => Container.set(`model.${model.tableName}`, model));
};

export default modelsLoader;
