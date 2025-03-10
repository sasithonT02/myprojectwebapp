import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";


const userModel = sequelize.define(
  "users",
  {
    user_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("Sale", "Customer"),
      allowNull: false,
    },
  },
  {
    tableName: "users",
    timestamps: false,
  }
);

export default userModel;
