import cartModel from "../models/cartModel.js";
import menuModel from "../models/menuModel.js";
import custModel from "../models/custModel.js";

// เพิ่มสินค้าลงในตะกร้า
const addToCart = async (req, res) => {
    try {
        const { menu_id } = req.body; // รับค่า menu_id จากข้อมูลที่ส่งมาใน request (clien)
        const user_id = req.user.user_id; // ดึง user_id จากข้อมูลผู้ใช้ที่ authenticate ผ่าน middleware

        // ค้นหาข้อมูล cust_id จากตาราง customers โดยใช้ user_id
        const customer = await custModel.findOne({ where: { user_id } });
        if (!customer) {
            // 404 คือ Not Found
            return res.status(404).json({ success: false, message: "ไม่เจอลูกค้าจ้า" }); // ถ้าไม่พบลูกค้า
        }
        const cust_id = customer.cust_id; // อันนี้คือเจอนะแล้วก็จะทำการ ดึง cust_id จากข้อมูลลูกค้า

        console.log(`Adding to cart: cust_id=${cust_id}, menu_id=${menu_id}`); // แสดงที่ console

        // ตรวจสอบว่ามีสินค้าในตะกร้าของลูกค้ารายนี้แล้วหรือไม่
        let cartItem = await cartModel.findOne({ where: { cust_id, menu_id } });

        if (cartItem) {
            // ถ้ามีอยู่แล้ว เพิ่มจำนวนสินค้า (quantity)
            await cartItem.update({ quantity: cartItem.quantity + 1 }); // อัพเดทจำนวนสินค้าในตะกร้า
            console.log(`Updated cart item: ${JSON.stringify(cartItem)}`); // แปลงข้อมูลเป็น JSON แล้วแสดงที่ console
        } else {
            // ถ้ายังไม่มี ให้เพิ่มสินค้าใหม่ลงในตะกร้า
            await cartModel.create({ cust_id, menu_id, quantity: 1 });
            console.log(`Created new cart item: cust_id=${cust_id}, menu_id=${menu_id}`);
        }

        res.json({ success: true, message: "เพิ่มสินค้าลงในตะกร้าแล้ว" }); // ส่งผลลัพธ์ให้ผู้ใช้ทราบ
    } catch (error) {
        console.error("Error adding to cart:", error); // แสดง error หากเกิดข้อผิดพลาด
        // 500 คือ Internal Server Error
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดขณะเพิ่มสินค้าลงตะกร้า" }); // ส่งข้อผิดพลาด
    }
};


// ลบสินค้าจากตะกร้า
const removeFromCart = async (req, res) => {
    try {
        const { menu_id } = req.body; // รับค่า menu_id จาก request
        const user_id = req.user.user_id; // ดึง user_id จากข้อมูลผู้ใช้ที่ authenticate

        // ค้นหาข้อมูล cust_id จากตาราง customers โดยใช้ user_id
        const customer = await custModel.findOne({ where: { user_id } });
        if (!customer) {
            // 404 คือ Not Found
            return res.status(404).json({ success: false, message: "ไม่เจอลูกค้า" }); // ถ้าไม่พบลูกค้า
        }
        const cust_id = customer.cust_id; // ดึง cust_id จากข้อมูลลูกค้า

        console.log(`Removing from cart: cust_id=${cust_id}, menu_id=${menu_id}`); // แสดง log

        // ค้นหารายการในตะกร้าของลูกค้าจาก menu_id
        let cartItem = await cartModel.findOne({ where: { cust_id, menu_id } });

        if (!cartItem) {
            return res.status(404).json({ success: false, message: "ไม่เจอเมนูในตะกร้า" }); // ถ้าไม่พบสินค้าในตะกร้า
        }

        if (cartItem.quantity > 1) {
            // ถ้าจำนวนสินค้ามากกว่า 1 ลดจำนวนลงทีละ 1
            await cartItem.update({ quantity: cartItem.quantity - 1 });
            console.log(`Updated cart item: ${JSON.stringify(cartItem)}`);
        } else {
            // ถ้ามีสินค้ามีแค่ 1 ชิ้น ให้ลบออกจากตะกร้า
            await cartItem.destroy();
            console.log(`Removed cart item: cust_id=${cust_id}, menu_id=${menu_id}`);
        }

        res.json({ success: true, message: "ลบเมนูออกจากตะกร้าแล้ว" }); // ส่งผลลัพธ์กลับไป
    } catch (error) {
        console.error("Error removing from cart:", error); // แสดง error หากเกิดข้อผิดพลาด
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดขณะทำการลบเมนูออกจากตะกร้า" }); // ส่งข้อผิดพลาด
    }
};


// ดึงข้อมูลตะกร้าสินค้าของลูกค้า
const getCart = async (req, res) => {
    try {
        const user_id = req.user.user_id; // ดึง user_id จากข้อมูลผู้ใช้ที่ authenticate

        // ค้นหาข้อมูล cust_id จากตาราง customers โดยใช้ user_id
        const customer = await custModel.findOne({ where: { user_id } });
        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found" }); // ถ้าไม่พบลูกค้า
        }
        const cust_id = customer.cust_id; // ดึง cust_id จากข้อมูลลูกค้า

        console.log(`Fetching cart for cust_id=${cust_id}`); // แสดง log

        // ดึงข้อมูลสินค้าจากตะกร้าของลูกค้า
        const cartItems = await cartModel.findAll({
            where: { cust_id },
            include: [{ model: menuModel, attributes: ["menu_name", "price"] }] // รวมข้อมูลจากเมนู
        });

        res.json({ success: true, cartItems }); // ส่งข้อมูลสินค้าตะกร้ากลับไป
    } catch (error) {
        console.error("Error fetching cart data:", error); // แสดง error
        res.status(500).json({ success: false, message: "Error fetching cart data" }); // ส่งข้อผิดพลาด
    }
};


export { addToCart, removeFromCart, getCart };