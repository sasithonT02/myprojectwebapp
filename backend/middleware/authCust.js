import jwt from "jsonwebtoken";
import custModel from "../models/custModel.js";

const checkCustomerExistence = async (req, res, next) => {
    const { authorization } = req.headers; // ดึงค่า Authorization จาก headers
    //console.log(req.headers); // สำหรับ debug

    //ถ้าไม่พบค่า Authorization ใน headers จะตอบกลับไปที่ client ด้วยข้อความ "Not Authorized"
    if (!authorization) {
        return res.json({ success: false, message: "Not Authorized" });
    }

    //การแยกคำว่า Bearer ออกจาก token โดยใช้ .split(' ')[1] จะได้เฉพาะ token (เช่น Bearer abc123 จะได้ abc123)
    const token = authorization.split(' ')[1]; // แยก 'Bearer' ออกจาก token

    //ถ้าไม่พบ token ใน Authorization จะตอบกลับไปที่ client ว่า "Token missing"
    if (!token) {
        return res.json({ success: false, message: "Token missing" });
    }

    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { user_id: token_decode.user_id }; // เก็บข้อมูล user_id ใน req.user

        // ดึง cust_id จากตาราง customers โดยใช้ user_id ที่ได้จาก token
        const customer = await custModel.findOne({ where: { user_id: token_decode.user_id } });
        if (customer) {
            req.user.cust_id = customer.cust_id; // เก็บ cust_id ใน req.user ถ้าพบข้อมูล
        } else {
            return res.json({ success: false, message: "Customer not found in Auth" });
        }
        next(); // ไปยัง middleware หรือ route ถัดไป
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

export default checkCustomerExistence;
