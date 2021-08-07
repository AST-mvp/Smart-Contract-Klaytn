import sequelize from "@src/loaders/sequelize";
import { DataTypes, Model, Optional } from "sequelize";
import Nfc from "./Nfc";

export interface ProductAttributes {
  id: string;
  kind: string;
  name: string;
  brandId: string;
}

export interface ProductCreationAttributes
  extends Optional<ProductAttributes, "id"> {}

class Product
  extends Model<ProductAttributes, ProductCreationAttributes>
  implements ProductAttributes
{
  public id!: string;

  public kind!: string;

  public name!: string;

  public brandId!: string;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;
}

Product.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    kind: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    brandId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  { sequelize, tableName: "products" }
);
Product.hasMany(Nfc, { foreignKey: "productId" });
Nfc.belongsTo(Product, { as: "product" });

export default Product;
