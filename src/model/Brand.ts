import sequelize from "@src/loaders/sequelize";
import { DataTypes, Model, Optional } from "sequelize";
import Product from "./Product";

export interface BrandAttributes {
  id: string;
  name: string;
}

export interface BrandCreationAttributes
  extends Optional<BrandAttributes, "id"> {}

class Brand
  extends Model<BrandAttributes, BrandCreationAttributes>
  implements BrandAttributes
{
  public id!: string;

  public name!: string;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;
}

Brand.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { sequelize, tableName: "brands" }
);
Brand.hasMany(Product, { foreignKey: "brandId" });
Product.belongsTo(Brand, { as: "brand" });

export default Brand;
