import Nfc from "@src/model/Nfc";
import Product from "@src/model/Product";
import Brand from "@src/model/Brand";
import User from "@src/model/User";
import Container from "typedi";

const modelsLoader = () => {
  [User, Brand, Product, Nfc].forEach((model) =>
    Container.set(`models.${model.tableName}`, model)
  );
};

export default modelsLoader;
