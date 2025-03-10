import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import menuModel from "./menuModel.js";
import ingredientModel from "./ingredientModel.js";

const tuseModel = sequelize.define(
    "tuse",
    {
        menu_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "menu",
                key: "menu_id",
            },
            primaryKey: true,  // ใช้เป็นส่วนหนึ่งของ primary key
        },
        ingredients_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "ingredients",
                key: "ingredients_id",
            },
            primaryKey: true,  // ใช้เป็นส่วนหนึ่งของ primary key
        },
        quantity: {
            type: DataTypes.DECIMAL(10, 3),
            allowNull: false,
        },
    },
    { 
        tableName: "tuse", 
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ['menu_id', 'ingredients_id'] // ทำให้เป็น composite primary key
            }
        ]
    }
);
tuseModel.belongsTo(menuModel, { foreignKey: "menu_id", onDelete: "CASCADE" });
tuseModel.belongsTo(ingredientModel, { foreignKey: "ingredients_id", onDelete: "CASCADE" });


export default tuseModel;
