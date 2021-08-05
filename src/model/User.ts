import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "@src/loaders/sequelize";

const UserTypeValues = ["email", "google", "kakao"] as const;
type UserType = typeof UserTypeValues[number];

interface UserAttributes {
  id: string;
  type: UserType;
  email?: string;
  pw?: string;
}

interface UserCreationAttributes extends Optional<UserAttributes, "id"> {}

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: string;

  public type!: UserType;

  public email?: string;

  public pw?: string;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
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
  },
  { sequelize, tableName: "users" }
);

User.sync();

export default User;
