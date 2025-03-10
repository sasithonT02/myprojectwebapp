import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import custModel from "./custModel.js";
import menuModel from "./menuModel.js";

const cartModel = sequelize.define(
    "cart",
    {
        cust_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: custModel,
                key: "cust_id",
            },
            onDelete: "CASCADE", // ถ้าลบข้อมูลตารางหลักจะลบข้อมูลตารางที่เชื่อมโยงด้วย
        },
        menu_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: menuModel,
                key: "menu_id",
            },
            onDelete: "CASCADE",
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1, // ค่าเริ่มต้นเป็น 1
        },
    },
    {
        tableName: "cart",
        timestamps: false, // ปิด timestamps (ไม่มี createdAt, updatedAt)
    }
);

// ตั้งความสัมพันธ์ระหว่าง cart กับ customer และ menu
cartModel.belongsTo(custModel, { foreignKey: "cust_id" });
cartModel.belongsTo(menuModel, { foreignKey: "menu_id" });

export default cartModel;
