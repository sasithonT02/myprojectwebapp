import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const custModel = sequelize.define(
    "customers",
    {
        cust_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        cust_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        phone_number: {
            type: DataTypes.STRING(10),
            allowNull: false,
            validate: {
                is:/^[0-9]{10}$/, // ตรวจสอบให้แน่ใจว่าเป็นตัวเลขและสัญลักษณ์ที่อนุญาต
            },
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'user_id',
            },
        },
    },
    { tableName: "customers", timestamps: false }
);

export default custModel;