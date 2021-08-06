import sequelize from "@src/loaders/sequelize";
import { Association, DataTypes, Model, Optional } from "sequelize";
import Product from "./Product";
import User from "./User";

export interface NfcAttributes {
  id: string;
  ownerId: string;
  productId: string;
  editionNo: number | null;
  manufactureDate: Date;
}

interface NfcCreationAttributes extends Optional<NfcAttributes, "id"> {}

class Nfc
  extends Model<NfcAttributes, NfcCreationAttributes>
  implements NfcAttributes
{
  public id!: string;

  public ownerId!: string;

  public productId!: string;

  public editionNo!: number | null;

  public manufactureDate!: Date;

  public static associations: {
    product: Association<Nfc, Product>;
  };
}

Nfc.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    editionNo: {
      type: DataTypes.INTEGER.UNSIGNED,
    },
    manufactureDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  { sequelize, tableName: "nfcs" }
);
Nfc.hasOne(Product, { foreignKey: "productId" });
Product.belongsTo(Nfc);
Nfc.hasOne(User, { foreignKey: "ownerId" });
User.belongsTo(Nfc);

export default Nfc;
