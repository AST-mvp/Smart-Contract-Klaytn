import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "@src/loaders/sequelize";

const UserTypeValues = ["email", "google", "kakao"] as const;
type UserType = typeof UserTypeValues[number];

const PermissionTypeValues = ["admin"] as const;
type PermissionType = typeof PermissionTypeValues[number];

export interface UserAttributes {
  id: string;
  type: UserType;
  email?: string;
  pw?: string;
  permission: PermissionType[];
}

interface UserCreationAttributes
  extends Optional<UserAttributes, "id" | "permission"> {}

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: string;

  public type!: UserType;

  public email?: string;

  public pw?: string;

  public permission!: PermissionType[];
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    type: {
      type: DataTypes.ENUM(...UserTypeValues),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
    },
    pw: {
      type: DataTypes.STRING,
    },
    permission: {
      type: DataTypes.ARRAY(DataTypes.ENUM(...PermissionTypeValues)),
      defaultValue: [],
    },
  },
  { sequelize, tableName: "users" }
);

export default User;
