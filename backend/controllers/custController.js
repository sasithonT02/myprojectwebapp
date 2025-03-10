import custModel from "../models/custModel.js";

// แก้ไขข้อมูลส่วนตัวของลูกค้า
const updateCustomer = async (req, res) => {
    // const user = { user_id: 1, name: "John Doe" }; 
    // const { user_id } = user; ดึงค่า user_id ออกมาจาก user
    const { user_id } = req.user; // user_id มาจาก token หลังจาก Authentication
    const { cust_name, address, phone_number } = req.body; // ข้อมูลที่จะแก้ไข

    try {
        // ค้นหา customer ตาม user_id
        const customer = await custModel.findOne({ where: { user_id } });

        if (!customer) {
            return res.status(404).json({ success: false, message: "ไม่เจอข้อมูลลูกค้า" });
        }

        // อัปเดตข้อมูล
        customer.cust_name = cust_name || customer.cust_name; // ถ้าไม่ได้รับค่าจาก req.body ให้ใช้ค่าเดิม
        customer.address = address || customer.address; // ถ้าไม่ได้รับค่าจาก req.body ให้ใช้ค่าเดิม
        customer.phone_number = phone_number || customer.phone_number; // ถ้าไม่ได้รับค่าจาก req.body ให้ใช้ค่าเดิม

        await customer.save(); // บันทึกข้อมูลลูกค้า

        res.status(200).json({ success: true, data: customer });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "การแก้ไขข้อมูลผิดพลาด" });
    }
};

// ดึงข้อมูลลูกค้าตาม user_id
const getCustomerByUserId = async (req, res) => {
    const { user_id } = req.user; // user_id มาจาก token หลังจาก Authentication

    try {
        const customer = await custModel.findOne({ where: { user_id } }); // ค้นหาข้อมูลลูกค้าตาม user_id

        if (!customer) {
            return res.status(404).json({ success: false, message: "ไม่เจอลูกค้าที่มีบัญชีผู้ใช้นี้" });
        }

        res.status(200).json({ success: true, data: customer });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "ไม่สามารถดึงข้อมูลลูกค้าตามรหัสผู้ใช้ได้" });
    }
};

export { updateCustomer, getCustomerByUserId };
