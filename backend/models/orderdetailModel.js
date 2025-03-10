import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import menuModel from "./menuModel.js";
import orderModel from "./orderModel.js";

const orderdetailModel = sequelize.define(
    "order_detail",
    {
        detail_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        order_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: orderModel,
                key: "order_id",
            },
            onDelete: "CASCADE",
        },
        menu_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: menuModel,
                key: "menu_id",
            },
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        tableName: "order_details",
        timestamps: false,
    }
);

orderdetailModel.belongsTo(orderModel, { foreignKey: "order_id", as: "orders" });
orderdetailModel.belongsTo(menuModel, { foreignKey: 'menu_id', as: 'menu' });

export default orderdetailModel;