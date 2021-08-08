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
  dropStartAt: Date;
  dropEndAt: Date;
}

export interface NfcCreationAttributes extends Optional<NfcAttributes, "id"> {}

class Nfc
  extends Model<NfcAttributes, NfcCreationAttributes>
  implements NfcAttributes
{
  public id!: string;

  public ownerId!: string;

  public productId!: string;

  public editionNo!: number | null;

  public manufactureDate!: Date;

  public dropStartAt!: Date;

  public dropEndAt!: Date;

  public readonly owner?: User;

  public readonly product?: Product;

  public static associations: {
    owner: Association<Nfc, User>;
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
    dropStartAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    dropEndAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  { sequelize, tableName: "nfcs" }
);

export default Nfc;
