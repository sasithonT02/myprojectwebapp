import ingredientModel from "../models/ingredientModel.js";

// เพิ่มวัตถุดิบ
const addIngredient = async (req, res) => {
    try {
        // ตรวจสอบวัตถุดิบว่ามีอยู่แล้วหรือไม่
        const existingIngredient = await ingredientModel.findOne({ where: {ingredients_name: req.body.ingredients_name }});

        if (existingIngredient) {
            return res.json({ success: false, message: "มีรายชื่อวัตถุดิบนี้อยู่แล้ว" });
        }

        // สร้างวัตถุดิบใหม่
        const ingredient = new ingredientModel({
            ingredients_name: req.body.ingredients_name,
            ingredients_unit: req.body.ingredients_unit,
            price: req.body.price
        });

        await ingredient.save(); // บันทึกข้อมูลลงฐานข้อมูล
        res.json({ success: true, message: "เพิ่มวัตถุดิบเรียบร้อย" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด กรุณาลองใหม่" });
    }
};


    // รายการวัตถุดิบ
    const listIngredient = async (req, res) => {
        try {
            const ingredients = await ingredientModel.findAll({}); // ค้นหาข้อมูลทั้งหมด
            res.json({ success: true, data: ingredients })
        } catch (error) {
            console.log(error)
            res.json({ success: false, message: "เกิดข้อผิดพลาด" })
        }

    };


    // ลบวัตถุดิบ
    const removeIngredient = async (req, res) => {
        try {
            const ingredient = await ingredientModel.findByPk(req.body.ingredients_id); // ค้นหาข้อมูลที่ต้องการลบฝั่ง server
            await ingredient.destroy();
            res.json({ success: true, message: "ลบวัตถุดิบเรียบร้อย" })
        } catch (error) {
            console.log(error);
            res.json({ success: false, message: "ไม่ถูกต้อง กรุณาลองใหม่" })
        }

    };


    // แก้ไขวัตถุดิบ
    const editIngredient = async (req, res) => {
        try {
            const ingredient = await ingredientModel.findByPk(req.body.ingredients_id); // ค้นหาข้อมูลที่ต้องการแก้ไขฝั่ง server

            if (!ingredient) {
                return res.json({ success: false, message: "ไม่พบวัตถุดิบ" }); // ถ้าไม่พบข้อมูล
            }

            // แก้ไขข้อมูล
            ingredient.ingredients_name = req.body.ingredients_name || ingredient.ingredients_name; // ถ้าไม่มีการส่งข้อมูลมา จะใช้ข้อมูลเดิม
            ingredient.ingredients_unit = req.body.ingredients_unit || ingredient.ingredients_unit; // ถ้าไม่มีการส่งข้อมูลมา จะใช้ข้อมูลเดิม
            ingredient.price = req.body.price || ingredient.price; // ถ้าไม่มีการส่งข้อมูลมา จะใช้ข้อมูลเดิม

            await ingredient.save(); // บันทึกข้อมูล

            res.json({ success: true, message: "แก้ไขวัตถุดิบเรียบร้อย" });
        } catch (error) {
            console.log(error);
            res.json({ success: false, message: "ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง" });
        }

    };


    export { addIngredient, listIngredient, removeIngredient, editIngredient };