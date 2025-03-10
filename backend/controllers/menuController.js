import menuModel from "../models/menuModel.js";
import fs from 'fs'; // Import the File System module to perform file operations
import { Op } from "sequelize";

// ฟังก์ชันดึงวันที่ปัจจุบันของไทยโดยไม่มีเวลา
const getThaiDate = () => {
    const today = new Date();
    today.setHours(today.getHours() + 7); // ปรับเวลาเป็นไทย
    return today.toISOString().split('T')[0]; // แปลงเป็น YYYY-MM-DD
};

// เมนูที่เกินวันที่ปัจจุบัน
// const removeOldMenus = async () => {
//     try {
//         const formattedToday = getThaiDate();

//         // ตั้งค่าช่วงเวลาเริ่มต้นของวันนี้
//         const startOfToday = `${formattedToday} 00:00:00`;

//         // ค้นหาเมนูที่มีวันที่เก่ากว่า
//         const oldMenus = await menuModel.findAll({
//             where: { menu_date: { [Op.lt]: startOfToday } }
//         });

//         // ลบไฟล์รูปภาพ
//         oldMenus.forEach(menu => {
//             if (menu.image) {
//                 fs.unlink(`uploads/${menu.image}`, (err) => { 
//                     if (err) console.error("ลบรูปภาพผิดพลาด:", err);
//                 });
//             }
//         });

//         // ลบเมนูอาหารที่หมดอายุ
//         await menuModel.destroy({
//             where: { menu_date: { [Op.lt]: startOfToday } }
//         });

//         console.log("ลบเมนูที่หมดอายุเรียบร้อย");
//     } catch (error) {
//         console.error("เกิดข้อผิดพลาดในการลบเมนูเก่า:", error);
//     }
// };


// เพิ่มเมนูอาหาร
const addMenu = async (req, res) => {

    let image_filename = `${req.file.filename}`; // รับชื่อไฟล์รูปภาพ

    const menu = new menuModel({
        menu_name: req.body.menu_name,
        description: req.body.description,
        menu_date: req.body.menu_date,
        price: req.body.price,
        image: image_filename,
    })
    try {
        await menu.save();
        res.json({ success: true, message: "เพิ่มเมนูอาหารเรียบร้อย" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "ไม่ถูกต้อง กรุณาลองใหม่" })
    }

};

// รายการเมนูอาหาร
const listMenu = async (req, res) => {
    try {
        const formattedToday = getThaiDate();

        //ตั้งค่าช่วงเวลาให้ครอบคลุมทั้งวัน
        const startOfDay = `${formattedToday} 00:00:00`;
        const endOfDay = `${formattedToday} 23:59:59`;

        // ดึงเฉพาะเมนูของวันนี้
        const menus = await menuModel.findAll({
            where: { 
                menu_date: { 
                    [Op.between]: [startOfDay, endOfDay] 
                } 
            }
        });
        res.json({ success: true, data: menus }); // ส่งข้อมูลในรูปแบบที่เหมาะสม
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "เกิดข้อผิดพลาด" });
    }
};


// รายการเมนูอาหารสำหรับแม่ค้า
const listMenuSeller = async (req, res) => {
    try {

        const menus = await menuModel.findAll({});
        res.json({ success: true, data: menus }); // ส่งข้อมูลในรูปแบบที่เหมาะสม
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "เกิดข้อผิดพลาด" });
    }
};


// ลบเมนูอาหาร
const removeMenu = async (req, res) => {
    try {
        const menu = await menuModel.findByPk(req.body.menu_id); // ค้นหาเมนูอาหารที่ต้องการลบ
        fs.unlink(`uploads/${menu.image}`, () => { }); // ลบไฟล์รูปภาพ

        await menu.update({ is_deleted: true }) // ลบเมนูอาหาร
        res.json({ success: true, message: "ลบเมนูอาหารเรียบร้อย" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง" })
    }
};


// แก้ไขเมนูอาหาร
const editMenu = async (req, res) => {
    try {
        const menu = await menuModel.findByPk(req.body.menu_id);

        if (!menu) {
            return res.json({ success: false, message: "ไม่พบเมนูอาหาร" });
        }

        // Update menu details
        menu.menu_name = req.body.menu_name || menu.menu_name;
        menu.description = req.body.description || menu.description;
        menu.menu_date = req.body.menu_date || menu.menu_date;
        menu.price = req.body.price || menu.price;

        // If a new image is uploaded, replace the old one
        if (req.file) {
            fs.unlink(`uploads/${menu.image}`, () => { }); // Delete the old image
            menu.image = req.file.filename;
        }

        await menu.save(); // บันทึกข้อมูล

        res.json({ success: true, message: "แก้ไขเมนูอาหารเรียบร้อย" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง" });
    }
};


export { addMenu, listMenu, removeMenu, editMenu, listMenuSeller/*, removeOldMenus*/ }; // Export the functions to be used in routes