import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import custModel from "./custModel.js";

const orderModel = sequelize.define(
    "order",
    {
        order_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        cust_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: custModel,
                key: "cust_id",
            },
            onDelete: "CASCADE",
        },
        order_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        delivery_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        payment_status: {
            type: DataTypes.ENUM('จ่ายแล้ว', 'ยังไม่จ่าย', 'รอดำเนินการ'),
            allowNull: true,
        },
    },
    {
        tableName: "orders",
        timestamps: false,
    }
);

orderModel.belongsTo(custModel, { foreignKey: 'cust_id', as: 'customers' });

export default orderModel;