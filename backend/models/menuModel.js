import { DataTypes } from "sequelize";
import sequelize from "../config/db.js"; // Import the Sequelize instance

const menuModel = sequelize.define(
  "menu",
  {
    menu_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    menu_name: { type: DataTypes.STRING(100), allowNull: false },
    description: { type: DataTypes.TEXT },
    menu_date: { type: DataTypes.DATE, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    image: { type: DataTypes.STRING(255) },
  },
  { tableName: "menu", timestamps: false }
);

export default menuModel;
