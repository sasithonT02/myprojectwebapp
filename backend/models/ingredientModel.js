import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const ingredientModel = sequelize.define(
    "ingredients",
    {
        ingredients_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        ingredients_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        ingredients_unit: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
    },
    { tableName: "ingredients", timestamps: false }
);

export default ingredientModel;