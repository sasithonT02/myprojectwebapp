import tuseModel from "../models/tuseModel.js";
import menuModel from "../models/menuModel.js";
import ingredientModel from "../models/ingredientModel.js";
import sequelize from "../config/db.js";

// เพิ่มวัตถุดิบในเมนู
const addMenuIngredients = async (req, res) => {
    // รับข้อมูลจาก client
    const { menu_id, ingredients } = req.body;
    // ตรวจสอบข้อมูล transaction ใน sequelize คือการทำงานหลายๆอย่างพร้อมกัน และถ้ามีข้อผิดพลาดจะยกเลิกทั้งหมด
    const transaction = await sequelize.transaction(); // ใช้ transaction

    try {
        for (const ingredient of ingredients) {
            await tuseModel.create({
                menu_id,
                ingredients_id: ingredient.ingredients_id,
                quantity: ingredient.quantity,
            }, { transaction });
        }
        
        await transaction.commit(); // ยืนยันการทำงานของ transaction
        res.json({ success: true, message: "เพิ่มวัตถุดิบในเมนูเรียบร้อย" });
    } catch (error) {
        await transaction.rollback(); // ยกเลิก transaction หากเกิดข้อผิดพลาด
        console.error(error);
        res.json({ success: false, message: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" });
    }
};


// แสดงรายการวัตถุดิบทั้งหมดในเมนู
const listMenuIngredients = async (req, res) => {
    // รับค่า menu_id จาก URL
    const { menu_id } = req.params;

    try {
        const menuIngredients = await tuseModel.findAll({
            where: { menu_id },
            include: [
                { model: menuModel, attributes: ["menu_name"] },
                { model: ingredientModel, attributes: ["ingredients_name", "ingredients_unit"] },
            ],
        });
        res.json({ success: true, data: menuIngredients });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด", error });
    }
};


// ลบวัตถุดิบในเมนู
const removeMenuIngredient = async (req, res) => {
    const { menu_id, ingredients_id } = req.params;  // ใช้ `req.params` เพื่อรับค่าจาก URL

    if (!ingredients_id) {
        return res.json({ success: false, message: "ไม่พบวัตถุดิบที่ต้องการลบ" });
    }

    console.log("Removing ingredient with menu_id:", menu_id, "and ingredients_id:", ingredients_id);  // ตรวจสอบค่าที่ได้รับ

    try {
        const result = await tuseModel.destroy({ where: { menu_id, ingredients_id } });

        if (result) {
            res.json({ success: true, message: "ลบวัตถุดิบเรียบร้อย" });
        } else {
            res.json({ success: false, message: "ไม่พบวัตถุดิบที่ต้องการลบ" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการลบวัตถุดิบ" });
    }
};


// แก้ไขปริมาณวัตถุดิบในเมนู
const updateMenuIngredient = async (req, res) => {
    const { menu_id, ingredients_id, quantity } = req.body;

    // || คือการเช็คว่าถ้าไม่มีข้อมูลในตัวแปรนั้นๆ ให้แสดงข้อความว่าข้อมูลไม่ครบถ้วน
    if (!ingredients_id || !menu_id || quantity == null) {
        return res.json({ success: false, message: "ข้อมูลไม่ครบถ้วน" });
    }

    if (quantity <= 0) {
        return res.json({ success: false, message: "ปริมาณวัตถุดิบต้องมากกว่า 0" });
    }

    try {
        const [updated] = await tuseModel.update(
            { quantity },
            { where: { menu_id, ingredients_id } }
        );

        if (!updated) {
            return res.json({ success: false, message: "ไม่พบวัตถุดิบในเมนูนี้" });
        }

        res.json({ success: true, message: "อัปเดตปริมาณวัตถุดิบในเมนูเรียบร้อย" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" });
    }
};


const calculateTotalIngredientCost = async (req, res) => {
    try {
        // ดึงรายการวัตถุดิบที่ใช้ทั้งหมดในวันที่เลือก
        const { date } = req.query; // ใช้ query parameter ในการกำหนดวันที่
        if (!date) return res.status(400).json({ success: false, message: "กรุณาระบุวันที่" });

        const menuIngredients = await tuseModel.findAll({
            include: [
                {
                    model: ingredientModel,
                    attributes: ['ingredients_id', 'price'],
                    as: 'ingredient' // ต้องตรงกับ alias ที่กำหนดใน model
                },
                {
                    model: menuModel,
                    attributes: ['menu_id', 'menu_name'],
                    where: { date } // กรองเฉพาะเมนูของวันที่เลือก
                }
            ]
        });

        // คำนวณราคาวัตถุดิบรวมของทุกเมนู
        const totalCost = menuIngredients.reduce((acc, tuse) => {
            const ingredientPrice = tuse.ingredient?.price || 0; // กัน error ถ้าไม่มีข้อมูล
            const quantity = tuse.quantity || 0;
            return acc + (ingredientPrice * quantity);
        }, 0);

        res.json({ success: true, totalCost });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการคำนวณราคาวัตถุดิบ" });
    }
};



export { addMenuIngredients, listMenuIngredients, removeMenuIngredient, updateMenuIngredient, calculateTotalIngredientCost };