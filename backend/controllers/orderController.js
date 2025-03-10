import orderModel from "../models/orderModel.js";
import orderdetailModel from "../models/orderdetailModel.js";
import custModel from "../models/custModel.js";
import menuModel from "../models/menuModel.js";
import tuseModel from "../models/tuseModel.js";
import ingredientModel from "../models/ingredientModel.js";
import cartModel from "../models/cartModel.js";
import { Op } from "sequelize";
import fs from "fs";
import path from "path";


// โหลดค่าเวลาเปิด-ปิดร้านจาก config.json
function getConfig() {
    const configPath = path.join(process.cwd(), "config.json");
    return JSON.parse(fs.readFileSync(configPath, "utf8"));
}

// ตรวจสอบว่าร้านเปิดรับออเดอร์หรือไม่
function isOrderingOpen() {
    const config = getConfig();
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const openMinutes = parseInt(config.open_time.split(":")[0]) * 60 + parseInt(config.open_time.split(":")[1]);
    const closeMinutes = parseInt(config.close_time.split(":")[0]) * 60 + parseInt(config.close_time.split(":")[1]);

    return currentTime >= openMinutes && currentTime <= closeMinutes;
}


// สร้างคำสั่งซื้อ
const createOrder = async (req, res) => {
    try {

        // ✅ เช็คว่าร้านเปิดรับออเดอร์หรือไม่
        if (!isOrderingOpen()) {
            return res.status(403).json({ success: false, message: "ขณะนี้ปิดรับออเดอร์แล้ว" });
        }
        const user_id = req.user.user_id; // รับ user_id จากผู้ใช้งานที่เข้าสู่ระบบ

        // ค้นหาข้อมูลลูกค้าจาก user_id
        const customer = await custModel.findOne({ where: { user_id } });

        if (!customer) {
            return res.status(404).json({ success: false, message: "ไม่มีลูกค้า" });
        }
        const cust_id = customer.cust_id; // รับ cust_id จากข้อมูลลูกค้า

        const { order_details } = req.body; // รับรายละเอียดของคำสั่งซื้อจาก body

        // ตรวจสอบว่ามีรายละเอียดคำสั่งซื้อหรือไม่
        if (!order_details || order_details.length === 0) {
            return res.status(400).json({ success: false, message: "ต้องระบุรายละเอียดการสั่งซื้อ" });
        }

        // สร้างคำสั่งซื้อใหม่ในตาราง orders
        const newOrder = await orderModel.create({
            cust_id,
            delivery_date: null,
            payment_status: null
        });

        // สร้างข้อมูล order_details ที่จะเพิ่มเข้าไปในตาราง order_details
        const orderDetailsData = order_details.map(detail => ({
            order_id: newOrder.order_id,
            menu_id: detail.menu_id,
            quantity: detail.quantity
        }));

        // เพิ่มข้อมูลรายละเอียดคำสั่งซื้อทั้งหมดลงในตาราง order_details
        await orderdetailModel.bulkCreate(orderDetailsData);

        // **เมื่อสั่งซื้อแล้วให้ลบข้อมูลสินค้าทั้งหมดในตะกร้าของ customer คนนั้น**
        await cartModel.destroy({ where: { cust_id } });

        res.status(201).json({ success: true, message: "สั่งซื้อสำเร็จ", order: newOrder });
    } catch (error) {
        console.error("Error creating order:", error); // แสดง error ใน console
        // ส่งข้อความและ error กลับไปให้ client
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ", error: error.message });
    }
};


// ดึงคำสั่งซื้อทั้งหมดของลูกค้าพร้อมรายละเอียด
const getOrders = async (req, res) => {
    try {
        const cust_id = req.user.cust_id; // รับ cust_id จาก req.user

        if (!cust_id) {
            return res.status(400).json({ message: "ขาดพารามิเตอร์ที่จำเป็น: cust_id" });
        }

        // ดึงคำสั่งซื้อทั้งหมดของลูกค้า
        const orders = await orderModel.findAll({
            // ระบุเฉพาะคอลัมน์ที่ต้องการดึง
            attributes: ['order_id', 'order_date', 'delivery_date', 'payment_status'],
            where: { cust_id }, // ค้นหาตาม cust_id
            order: [['order_id', 'DESC']] // เรียงลำดับจากมากไปน้อย
        });

        // ดึงรายละเอียดคำสั่งซื้อ
        const orderDetails = await orderdetailModel.findAll({
            // ระบุเฉพาะคอลัมน์ที่ต้องการดึง
            attributes: ['order_id', 'menu_id', 'quantity'],
            where: {
                // map คือ function ที่ใช้สำหรับการวน loop ใน array และ return array ใหม่
                order_id: orders.map(order => order.order_id) // ค้นหาตาม order_id ที่ดึงมา
            }
        });

        // ดึงข้อมูลเมนู
        const menuItems = await menuModel.findAll({
            // ระบุเฉพาะคอลัมน์ที่ต้องการดึง
            attributes: ['menu_id', 'menu_name', 'price'],
            where: {
                menu_id: orderDetails.map(detail => detail.menu_id) // ค้นหาตาม menu_id ที่ดึงมา
            }
        });

        // จัดกลุ่มข้อมูลในแต่ละคำสั่งซื้อ
        const orderResults = orders.map(order => {
            // กรองรายละเอียดของคำสั่งซื้อที่ตรงกับ order_id ของคำสั่งซื้อนั้น
            const details = orderDetails.filter(detail => detail.order_id === order.order_id);

            let total_price = 0;
            // สร้างข้อมูลรายละเอียดคำสั่งซื้อ
            const detailedOrder = details.map(detail => {
                // ค้นหาข้อมูลเมนูที่ตรงกับ menu_id ของรายละเอียดคำสั่งซื้อ
                const menu = menuItems.find(item => item.menu_id === detail.menu_id);
                const item_price = menu ? menu.price : 0; // ดึงราคาสินค้า
                const item_total = item_price * detail.quantity; // คำนวณราคารวมของแต่ละเมนู
                total_price += item_total; // รวมราคาในระดับคำสั่งซื้อ
                return {
                    // สร้าง object ข้อมูลรายละเอียดคำสั่งซื้อ
                    menu_name: menu ? menu.menu_name : 'Unknown Menu', // ชื่อเมนู
                    quantity: detail.quantity, // จำนวน
                    item_price: item_price, // แสดงราคาต่อหน่วย
                    item_total: item_total // แสดงราคารวมของเมนูนั้น
                };
            });

            // สร้าง object ข้อมูลคำสั่งซื้อ พร้อมรายละเอียด
            return {
                order_id: order.order_id, // รหัสคำสั่งซื้อ
                order_date: order.order_date, // วันที่สั่ง
                delivery_date: order.delivery_date, // วันที่ส่งมอบ
                payment_status: order.payment_status, // สถานะการชำระเงิน
                total_price, //ส่งราคากลับไปที่ front end
                order_details: detailedOrder // รายละเอียดคำสั่งซื้อ
            };
        });

        // 200 คือ HTTP status code ที่หมายถึงสำเร็จ
        res.status(200).json(orderResults);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "Error fetching orders", error: error.message });
    }
};


// ดึงข้อมูลคำสั่งซื้อทั้งหมด
const getAllOrders = async (req, res) => {
    try {
        // ดึงข้อมูลคำสั่งซื้อทั้งหมด
        const orders = await orderModel.findAll({
            attributes: ['order_id', 'order_date', 'delivery_date', 'payment_status', 'cust_id'],
            order: [['order_id', 'DESC']]
        });

        // ดึงข้อมูล order_details ทั้งหมด
        const orderDetails = await orderdetailModel.findAll({
            attributes: ['detail_id', 'order_id', 'menu_id', 'quantity']
        });

        // ดึงข้อมูลเมนูทั้งหมด
        const menus = await menuModel.findAll({
            attributes: ['menu_id', 'menu_name', 'price']
        });

        // ดึงข้อมูลลูกค้า
        const customers = await custModel.findAll({
            attributes: ['cust_id', 'cust_name', 'address', 'phone_number']
        });

        // สร้าง mapping ข้อมูลเมนู
        const menuMap = {};
        menus.forEach(menu => {
            menuMap[menu.menu_id] = { name: menu.menu_name, price: menu.price };
        });

        // สร้าง mapping ข้อมูลลูกค้า
        const customerMap = {};
        customers.forEach(customer => {
            customerMap[customer.cust_id] = {
                name: customer.cust_name,
                address: customer.address,
                phone: customer.phone_number
            };
        });

        // รวม orderDetails กับเมนู
        const orderDetailsWithMenu = orderDetails.map(detail => ({
            detail_id: detail.detail_id,
            order_id: detail.order_id,
            menu_id: detail.menu_id,
            menu_name: menuMap[detail.menu_id]?.name || "Unknown Menu",
            price: menuMap[detail.menu_id]?.price || 0,
            quantity: detail.quantity
        }));

        // จัดรูปแบบ orders และเพิ่ม order_details + ข้อมูลลูกค้า
        const formattedOrders = orders.map(order => {
            // คำนวณ total_price
            const orderDetailsForOrder = orderDetailsWithMenu.filter(detail => detail.order_id === order.order_id);
            const total_price = orderDetailsForOrder.reduce((total, detail) => {
                return total + (detail.price * detail.quantity);
            }, 0);

            return {
                ...order.toJSON(),
                customer: customerMap[order.cust_id] || { name: "Unknown", address: "Unknown", phone: "Unknown" },
                order_details: orderDetailsForOrder,
                total_price // เพิ่ม total_price ที่นี่
            };
        });

        res.status(200).json({ success: true, data: formattedOrders });

    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ success: false, message: "Error fetching orders", error: error.message });
    }
};


// อัปเดตข้อมูลคำสั่งซื้อ เช่น วันที่ส่งมอบ และสถานะการชำระเงิน
const updateOrder = async (req, res) => {
    try {
        // req.params คือ parameters ที่ส่งมากับ URL เช่น /orders/:id
        const { id } = req.params; // รับ order_id จาก URL parameters
        const { delivery_date, payment_status } = req.body; // รับข้อมูลใหม่ที่ต้องการอัปเดต

        const order = await orderModel.findByPk(id); // ค้นหาคำสั่งซื้อจาก order_id
        if (!order) {
            return res.status(404).json({ message: "ไม่พบคำสั่งซื้อ" });
        }

        // อัปเดตข้อมูลคำสั่งซื้อ
        await order.update({ delivery_date, payment_status });
        res.status(200).json({ message: "อัปเดตคำสั่งซื้อเรียบร้อยแล้ว" });
    } catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดตคำสั่งซื้อ", error: error.message });
    }
};


// ลบคำสั่งซื้อ
const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params; // รับ order_id จาก URL parameters

        // ดึงข้อมูลคำสั่งซื้อเพื่อตรวจสอบ payment_status
        const order = await orderModel.findOne({ where: { order_id: id } });

        // ตรวจสอบ payment_status
        if (order.payment_status === "จ่ายแล้ว" || order.payment_status === "ยังไม่จ่าย") {
            return res.status(400).json({
                message: "ไม่สามารถยกเลิกคำสั่งซื้อที่ดำเนินการแล้ว (จ่ายแล้วหรือยังไม่จ่าย)"
            });
        }

        // ก่อนที่จะลบคำสั่งซื้อ ต้องลบรายการใน order_details ก่อน
        // await orderdetailModel.destroy({ where: { order_id: id } });

        // ลบคำสั่งซื้อจากตาราง orders
        const deleted = await orderModel.destroy({ where: { order_id: id } });
        if (!deleted) {
            return res.status(404).json({ message: "ไม่พบคำสั่งซื้อ" });
        }

        res.status(200).json({ message: "ลบคำสั่งซื้อเรียบร้อยแล้ว" });
    } catch (error) {
        console.error("Error deleting order:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบคำสั่งซื้อ", error: error.message });
    }
};


// การคำนวณวัตถุดิบที่ใช้ในการทำอาหาร
const getIngredientUsage = async (req, res) => {
    try {

        const { date } = req.query;
        // ดึงข้อมูลรายละเอียดคำสั่งซื้อทั้งหมด
        const orderDetails = await orderdetailModel.findAll({
            attributes: ["menu_id", "quantity"],
            include: [
                {
                    model: menuModel,
                    as: "menu",
                    attributes: ["menu_name"],
                },
                {
                    model: orderModel,
                    as: "orders", // ✅ ตรวจสอบว่า alias ตรงกับที่กำหนดใน orderdetailModel
                    attributes: ["order_date"],
                    required: true, // ✅ บังคับให้ JOIN
                },
            ],
            where: {
                "$orders.order_date$": new Date(date).toISOString().split("T")[0]
            }
        });
        // ตรวจสอบว่ามีรายละเอียดคำสั่งซื้อหรือไม่
        if (orderDetails.length === 0) {
            // ส่งข้อมูลกลับไปให้ client โดยไม่มีข้อมูล
            return res.json({ success: true, data: { menus: [], summary: { total_ingredients: [], total_price: 0 } } });
        }

        // สร้าง object เพื่อเก็บข้อมูลการใช้วัตถุดิบของแต่ละเมนู
        const menuUsage = {};
        // สร้าง object เพื่อเก็บข้อมูลการใช้วัตถุดิบทั้งหมด
        const ingredientSummary = {};

        // วน loop ในรายละเอียดคำสั่งซื้อแต่ละรายการ
        for (const order of orderDetails) {
            const { menu_id, quantity, menu } = order;
            const menu_name = menu?.menu_name || "ไม่ทราบชื่อเมนู";

            // รวมวัตถุดิบที่ใช้ในเมนูเดียวกัน
            if (!menuUsage[menu_id]) {
                menuUsage[menu_id] = {
                    menu_id,
                    menu_name,
                    total_quantity: 0, // ✅ เก็บจำนวนทั้งหมดที่ถูกสั่ง
                    ingredients: [] // เก็บวัตถุดิบที่ใช้ในเมนูนี้
                };
            }

            menuUsage[menu_id].total_quantity += quantity;

            // ดึงวัตถุดิบที่ใช้ในเมนูนี้
            const menuIngredients = await tuseModel.findAll({
                where: { menu_id },
                include: [{
                    model: ingredientModel,
                    attributes: ["ingredients_id", "ingredients_name", "ingredients_unit", "price"]
                }]
            });

            // วน loop ในวัตถุดิบที่ใช้ในเมนูนี้
            for (const menuIngredient of menuIngredients) {
                const { ingredients_id, ingredients_name, ingredients_unit, price } = menuIngredient.ingredient;
                const requiredQty = menuIngredient.quantity * quantity;

                // รวมวัตถุดิบที่มีอยู่แล้วแทนที่จะเพิ่มใหม่
                let existingIngredient = menuUsage[menu_id].ingredients.find(item => item.ingredients_id === ingredients_id);
                if (existingIngredient) {
                    existingIngredient.total_quantity += requiredQty;
                } else {
                    // push คือ ข้อมูลใหม่ที่จะเพิ่มเข้าไปใน array
                    menuUsage[menu_id].ingredients.push({
                        ingredients_id,
                        ingredients_name,
                        ingredients_unit,
                        price,
                        total_quantity: requiredQty
                    });
                }

                // รวมวัตถุดิบใน ingredientSummary
                if (!ingredientSummary[ingredients_id]) {
                    ingredientSummary[ingredients_id] = {
                        ingredients_id,
                        ingredients_name,
                        ingredients_unit,
                        price,
                        total_quantity: 0
                    };
                }
                ingredientSummary[ingredients_id].total_quantity += requiredQty;
            }
        }

        // คำนวณราคาทั้งหมดของวัตถุดิบที่ใช้
        const total_price = Object.values(ingredientSummary).reduce((sum, item) => sum + (item.price * item.total_quantity), 0);

        res.json({
            success: true,
            data: {
                // แปลง object เป็น array และเอาแค่ value มา
                menus: Object.values(menuUsage),
                // สรุปข้อมูลวัตถุดิบทั้งหมด
                summary: {
                    total_ingredients: Object.values(ingredientSummary),
                    // ปัดเศษทศนิยม 2 ตำแหน่ง
                    total_price: total_price.toFixed(2)
                }
            }
        });

    } catch (error) {
        console.error("Error calculating ingredients:", error);
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการคำนวณวัตถุดิบ", error: error.toString() });
    }
};


// ฟังก์ชันดึงวันที่ปัจจุบันของไทยโดยไม่มีเวลา
const getThaiDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // แปลงเป็น YYYY-MM-DD
};

// ดึงข้อมูลคำสั่งซื้อทั้งหมด
const getOrderSummary = async (req, res) => {
    try {
        const formattedToday = getThaiDate();
        const { date } = req.query; // ดึงวันที่จาก query parameters
        console.log("Selected date:", date);

        let whereConditions = {};
        if (date) {
            whereConditions.order_date = {
                [Op.between]: [
                    `${date} 00:00:00`, // เริ่มต้นเวลา 00:00:00
                    `${date} 23:59:59`  // สิ้นสุดเวลา 23:59:59
                ]
            };
        }

        console.log("Where conditions:", whereConditions);

        // ตรวจสอบก่อนว่าในวันที่นั้นมีคำสั่งซื้อหรือไม่
        const orderExist = await orderModel.count({ where: whereConditions });

        if (orderExist === 0) {
            return res.json({
                success: true,
                message: "ไม่มีคำสั่งซื้อในวันที่เลือก"
            });
        }

        // นับจำนวนคำสั่งซื้อในวันที่เลือก
        const totalOrders = await orderModel.count({ where: whereConditions });

        // นับจำนวนคำสั่งซื้อที่ชำระแล้ว
        const completedOrdersData = await orderModel.findAll({
            where: {
                payment_status: 'จ่ายแล้ว',
                ...whereConditions,
            },
            attributes: ['order_id'],
            include: [{
                model: custModel,
                as: "customers",
                attributes: ['cust_name']
            }]
        });

        // คำนวณยอดเงินรวมของคำสั่งซื้อที่ชำระแล้ว
        let completedAmount = 0;
        const completedCustomers = [];

        for (const order of completedOrdersData) {
            const orderDetails = await orderdetailModel.findAll({
                where: { order_id: order.order_id },
                attributes: ['quantity', 'menu_id']
            });

            let orderTotal = 0;
            for (const detail of orderDetails) {
                const menu = await menuModel.findOne({
                    where: { menu_id: detail.menu_id },
                    attributes: ['price']
                });
                orderTotal += (menu.price || 0) * detail.quantity;
            }
            completedAmount += orderTotal;
            completedCustomers.push(order.customers.cust_name);
        }

        // นับจำนวนคำสั่งซื้อที่ยังไม่ชำระ
        // ดึงข้อมูลคำสั่งซื้อที่ยังไม่ชำระเงิน
        const pendingOrdersData = await orderModel.findAll({
            where: {
                payment_status: 'ยังไม่จ่าย',
                ...whereConditions,
            },
            attributes: ['order_id'],
            include: [{
                model: custModel,
                as: "customers",
                attributes: ['cust_name']
            }]
        });

        // คำนวณยอดเงินรวมของคำสั่งซื้อที่ยังไม่ชำระ
        let pendingAmount = 0;
        const pendingCustomers = [];

        for (const order of pendingOrdersData) {
            const orderDetails = await orderdetailModel.findAll({
                where: { order_id: order.order_id },
                attributes: ['quantity', 'menu_id']
            });

            let orderTotal = 0;
            for (const detail of orderDetails) {
                const menu = await menuModel.findOne({
                    where: { menu_id: detail.menu_id },
                    attributes: ['price']
                });
                orderTotal += (menu.price || 0) * detail.quantity;
            }
            pendingAmount += orderTotal;
            pendingCustomers.push(order.customers.cust_name);
        }

        // ดึงข้อมูลรายละเอียดคำสั่งซื้อ
        const orderDetails = await orderdetailModel.findAll({
            attributes: ['order_id', 'quantity', 'menu_id'],
            include: [{
                model: orderModel,
                as: 'orders',
                where: whereConditions,
                required: true,
                attributes: [],
            }],
        });

        // ดึงข้อมูลเมนูเพื่อนำไปคำนวณราคา
        const menus = await menuModel.findAll({ attributes: ['menu_id', 'price', 'menu_name'] });

        // สร้าง object แม็พ menu_id → price และ menu_id → menu_name
        const menuMap = {};
        const menuNameMap = {};
        menus.forEach(menu => {
            menuMap[menu.menu_id] = parseFloat(menu.price); // เผื่อ price เป็น string
            menuNameMap[menu.menu_id] = menu.menu_name; // แม็พ menu_id → menu_name
        });

        // ดึงข้อมูลวัตถุดิบที่ใช้ในแต่ละเมนู
        const menuIngredients = await tuseModel.findAll({
            include: [{
                model: ingredientModel,
                attributes: ['ingredients_id', 'price']
            }]
        });

        // คำนวณยอดรวมทั้งหมด
        let totalAmount = 0;
        let totalIngredientCost = 0;

        // จัดกลุ่มข้อมูลตามเมนู
        const menuSales = orderDetails.reduce((acc, detail) => {
            const menuId = detail.menu_id;
            const quantity = detail.quantity;

            if (!acc[menuId]) {
                acc[menuId] = 0;
            }
            acc[menuId] += quantity;
            return acc;
        }, {});

        // สร้าง array ของเมนูและจำนวนที่ขายได้
        const menuSalesData = Object.keys(menuSales).map(menuId => ({
            menu_name: menuNameMap[menuId] || "ไม่ทราบเมนู",
            total_sold: menuSales[menuId]
        }));


        // for (const detail of orderDetails) {
        //     // ดึงข้อมูลคำสั่งซื้อเพื่อตรวจสอบ payment_status
        //     const order = await orderModel.findOne({
        //         where: {
        //             order_id: detail.order_id,
        //             payment_status: 'จ่ายแล้ว' // เฉพาะคำสั่งซื้อที่จ่ายแล้ว
        //         }
        //     });

        //     // ถ้ามีคำสั่งซื้อที่จ่ายแล้ว
        //     if (order) {
        //         const menuPrice = menuMap[detail.menu_id] || 0;
        //         totalAmount += menuPrice * detail.quantity;


        for (const detail of orderDetails) {
            const menuPrice = menuMap[detail.menu_id] || 0;
            totalAmount += menuPrice * detail.quantity;

            // ดึงข้อมูลวัตถุดิบที่ใช้ในเมนูนี้
            const ingredientsForMenu = menuIngredients.filter(ing => ing.menu_id === detail.menu_id);

            // คำนวณราคารวมของวัตถุดิบที่ใช้ในเมนูนี้
            ingredientsForMenu.forEach(ing => {
                const ingredientPrice = ing.ingredient.price || 0;
                totalIngredientCost += ingredientPrice * ing.quantity * detail.quantity;
            });
        }
        //}

        res.json({
            success: true,
            totalOrders,
            completedAmount: Number(completedAmount || 0),
            completedCustomers, // เพิ่มรายชื่อลูกค้าที่ชำระแล้ว
            pendingOrders: pendingOrdersData.length, // จำนวนคำสั่งซื้อที่ยังไม่ชำระ
            pendingAmount: Number(pendingAmount || 0), // ยอดเงินรวมของคำสั่งซื้อที่ยังไม่ชำระ
            pendingCustomers, // รายชื่อลูกค้าที่ยังไม่ชำระ
            totalAmount: Number(totalAmount.toFixed(2)), // ยอดรวมคำสั่งซื้อ
            totalIngredientCost: Number(totalIngredientCost.toFixed(2)), // ราคารวมของวัตถุดิบที่ใช้ทั้งหมด
            menuSales: menuSalesData // ข้อมูลยอดขายเมนู
        });
    } catch (error) {
        console.error("Error fetching order summary:", error);
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดขณะดึงข้อมูลสรุปคำสั่งซื้อ" });
    }
};


// const getOrderSummary = async (req, res) => {
//     try {
//         const formattedToday = getThaiDate();
//         const { date } = req.query; // ดึงวันที่จาก query parameters
//         console.log("Selected date:", date);

//         let whereConditions = {};
//         if (date) {
//             whereConditions.order_date = {
//                 [Op.between]: [
//                     `${date} 00:00:00`, // เริ่มต้นเวลา 00:00:00
//                     `${date} 23:59:59`  // สิ้นสุดเวลา 23:59:59
//                 ]
//             };
//         }

//         console.log("Where conditions:", whereConditions);

//         // ตรวจสอบก่อนว่าในวันที่นั้นมีคำสั่งซื้อหรือไม่
//         const orderExist = await orderModel.count({ where: whereConditions });

//         if (orderExist === 0) {
//             return res.json({
//                 success: true,
//                 message: "ไม่มีคำสั่งซื้อในวันที่เลือก"
//             });
//         }

//         // นับจำนวนคำสั่งซื้อในวันที่เลือก
//         const totalOrders = await orderModel.count({ where: whereConditions });

//         // นับจำนวนคำสั่งซื้อที่ชำระแล้ว
//         const completedOrders = await orderModel.count({
//             where: {
//                 payment_status: 'จ่ายแล้ว',
//                 ...whereConditions,
//             }
//         });

//         // นับจำนวนคำสั่งซื้อที่ยังไม่ชำระ
//         const pendingOrders = await orderModel.count({
//             where: {
//                 payment_status: { [Op.or]: ['ยังไม่จ่าย', 'รอดำเนินการ'] },
//                 ...whereConditions,
//             }
//         });

//         // ดึงข้อมูลรายละเอียดคำสั่งซื้อ
//         const orderDetails = await orderdetailModel.findAll({
//             attributes: ['order_id', 'quantity', 'menu_id'],
//             include: [{
//                 model: orderModel,
//                 as: 'orders',
//                 where: whereConditions,
//                 required: true,
//                 attributes: [],
//             }],
//         });

//         // ดึงข้อมูลเมนูเพื่อนำไปคำนวณราคา
//         const menus = await menuModel.findAll({ attributes: ['menu_id', 'price'] });

//         // สร้าง object แม็พ menu_id → price
//         const menuMap = {};
//         menus.forEach(menu => {
//             menuMap[menu.menu_id] = parseFloat(menu.price); // เผื่อ price เป็น string
//         });


//         // // คำนวณยอดรวมทั้งหมด
//         // let totalAmount = 0;
//         // orderDetails.forEach(detail => {
//         //     const menuPrice = menuMap[detail.menu_id] || 0;
//         //     totalAmount += menuPrice * detail.quantity;
//         // });

//         // // ดึงข้อมูลวัตถุดิบที่ใช้ในแต่ละเมนู
//         // const menuIngredients = await tuseModel.findAll({
//         //     include: [{
//         //         model: ingredientModel,
//         //         attributes: ['ingredients_id', 'price']
//         //     }]
//         // });

//         // // คำนวณราคารวมของวัตถุดิบที่ใช้ทั้งหมด
//         // let totalIngredientCost = 0;
//         // for (const order of orderDetails) {
//         //     const { menu_id, quantity } = order;

//         //     // ดึงข้อมูลวัตถุดิบที่ใช้ในเมนูนี้
//         //     const ingredientsForMenu = menuIngredients.filter(ing => ing.menu_id === menu_id);

//         //     // คำนวณราคารวมของวัตถุดิบที่ใช้ในเมนูนี้
//         //     ingredientsForMenu.forEach(ing => {
//         //         const ingredientPrice = ing.ingredient.price || 0;
//         //         totalIngredientCost += ingredientPrice * ing.quantity * quantity;
//         //     });
//         // }

//         // คำนวณยอดรวมทั้งหมด
// let totalAmount = 0;
// let totalIngredientCost = 0;

// for (const detail of orderDetails) {
//     // ดึงข้อมูลคำสั่งซื้อเพื่อตรวจสอบ payment_status
//     const order = await orderModel.findOne({
//         where: {
//             order_id: detail.order_id,
//             payment_status: 'จ่ายแล้ว' // เฉพาะคำสั่งซื้อที่จ่ายแล้ว
//         }
//     });

//     // ถ้ามีคำสั่งซื้อที่จ่ายแล้ว
//     if (order) {
//         const menuPrice = menuMap[detail.menu_id] || 0;
//         totalAmount += menuPrice * detail.quantity;

//         // ดึงข้อมูลวัตถุดิบที่ใช้ในเมนูนี้
//         const ingredientsForMenu = menuIngredients.filter(ing => ing.menu_id === detail.menu_id);

//         // คำนวณราคารวมของวัตถุดิบที่ใช้ในเมนูนี้
//         ingredientsForMenu.forEach(ing => {
//             const ingredientPrice = ing.ingredient.price || 0;
//             totalIngredientCost += ingredientPrice * ing.quantity * detail.quantity;
//         });
//     }
// }

//         res.json({
//             success: true,
//             totalOrders,
//             completedOrders,
//             pendingOrders,
//             totalAmount: Number(totalAmount.toFixed(2)), // ให้เป็นทศนิยม 2 ตำแหน่ง
//             totalIngredientCost: Number(totalIngredientCost.toFixed(2)) // ราคารวมของวัตถุดิบที่ใช้ทั้งหมด
//         });
//     } catch (error) {
//         console.error("Error fetching order summary:", error);
//         res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดขณะดึงข้อมูลสรุปคำสั่งซื้อ" });
//     }
// };

// ฟังก์ชันดึงวันที่ปัจจุบันของไทยโดยไม่มีเวลา
// const getThaiDate = () => {
//     const today = new Date();
//     today.setHours(today.getHours() + 7); // ปรับเวลาเป็นไทย
//     return today.toISOString().split('T')[0]; // แปลงเป็น YYYY-MM-DD
// };

// ดึงข้อมูลคำสั่งซื้อทั้งหมด
// const getOrderSummary = async (req, res) => {
//     try {
//         const formattedToday = getThaiDate();
//         const { date } = req.query; // ดึงวันที่จาก query parameters
//         console.log("Selected date:", date);

//         let whereConditions = {};
//         if (date) {
//             whereConditions.order_date = {
//                 [Op.between]: [
//                     `${date} 00:00:00`,
//                     `${date} 23:59:59`
//                 ]
//             };
//         }

//         console.log("Where conditions:", whereConditions);

//         // ตรวจสอบก่อนว่าในวันที่นั้นมีคำสั่งซื้อหรือไม่
//         const orderExist = await orderModel.count({ where: whereConditions });

//         if (orderExist === 0) {
//             return res.json({
//                 success: true,
//                 message: "ไม่มีคำสั่งซื้อในวันที่เลือก"
//             });
//         }

//         // นับจำนวนคำสั่งซื้อในวันที่เลือก
//         const totalOrders = await orderModel.count({ where: whereConditions });

//         // นับจำนวนคำสั่งซื้อที่ชำระแล้ว
//         const completedOrders = await orderModel.count({
//             where: {
//                 payment_status: 'จ่ายแล้ว',
//                 ...whereConditions,
//             }
//         });

//         // นับจำนวนคำสั่งซื้อที่ยังไม่ชำระ
//         const pendingOrders = await orderModel.count({
//             where: {
//                 payment_status: { [Op.or]: ['ยังไม่จ่าย', 'รอดำเนินการ'] },
//                 ...whereConditions,
//             }
//         });

//         // ดึงข้อมูลรายละเอียดคำสั่งซื้อ
//         const orderDetails = await orderdetailModel.findAll({
//             attributes: ['order_id', 'quantity', 'menu_id'],
//             include: [{
//                 model: orderModel,
//                 as: 'orders',
//                 where: whereConditions,
//                 required: true,
//                 attributes: [],
//             }],
//         });

//         // ดึงข้อมูลเมนูเพื่อนำไปคำนวณราคา
//         const menus = await menuModel.findAll({ attributes: ['menu_id', 'price'] });

//         // สร้าง object แม็พ menu_id → price
//         const menuMap = {};
//         menus.forEach(menu => {
//             menuMap[menu.menu_id] = parseFloat(menu.price); // เผื่อ price เป็น string
//         });

//         // คำนวณยอดรวมทั้งหมด
//         let totalAmount = 0;
//         orderDetails.forEach(detail => {
//             const menuPrice = menuMap[detail.menu_id] || 0;
//             totalAmount += menuPrice * detail.quantity;
//         });

//         res.json({
//             success: true,
//             totalOrders,
//             completedOrders,
//             pendingOrders,
//             totalAmount: Number(totalAmount.toFixed(2)), // ให้เป็นทศนิยม 2 ตำแหน่ง
//         });
//     } catch (error) {
//         console.error("Error fetching order summary:", error);
//         res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดขณะดึงข้อมูลสรุปคำสั่งซื้อ" });
//     }
// };

export { createOrder, getOrders, getAllOrders, updateOrder, deleteOrder, getIngredientUsage, getOrderSummary };