import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import custModel from "../models/custModel.js";

// ผู้ใช้เข้าสู่ระบบ
const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        // ค้นหาผู้ใช้ในฐานข้อมูล
        const user = await userModel.findOne({ where: { username } });

        if (!user) {
            return res.json({ success: false, message: "ไม่มีผู้ใช้นี้อยู่" })
        }

        // ตรวจสอบรหัสผ่าน
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({ success: false, message: "รหัสผ่านไม่ถูกต้อง" })
        }

        // role
        const role = user.role;
        const token = createToken(user.user_id);
        res.json({ success: true, token, role });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "เกิดข้อผิดพลาดระหว่างการเข้าสู่ระบบ" });
    }
};

// สร้าง token
const createToken = (user_id) => {
    return jwt.sign({ user_id }, process.env.JWT_SECRET, { expiresIn: "5h" })
}


// ลงทะเบียนผู้ใช้
const registerUser = async (req, res) => {
    
    const { username, password, cust_name, address, phone_number } = req.body;

    try {
        // เช็คว่ามีบัญชีผู้ใช้นี้อยู่แล้วหรือไม่
        const exists = await userModel.findOne({ where: { username } });

        if (exists) {
            return res.json({ success: false, message: "มีบัญชีผู้ใช้นี้อยู่แล้ว" })
        }

        // Validate username: Only allows alphanumeric characters and underscores, length 3-20
        const isUsernameValid = (username) => {
            const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
            return usernameRegex.test(username);
        };

        if (!isUsernameValid(username)) {
            return res.json({
                success: false,
                message: "กรุณากรอกชื่อผู้ใช้ที่ถูกต้อง โดยมี 3-20 ตัวอักษร ตัวเลข และขีดล่างเท่านั้น"
            });
        };

        // ตรวจสอบความยาวของรหัสผ่าน
        if (password.length < 8) {
            return res.json({
                success: false,
                message: "รหัสผ่านต้องมีมากกว่า 8 ตัวขึ้นไป"
            });
        };

        // ตรวจสอบหมายเลขโทรศัพท์
        const isPhoneNumberValid = (phone) =>/^[0-9]{10}$/.test(phone);
        if (!isPhoneNumberValid(phone_number)) {
            return res.json({
                success: false,
                message: "กรุณาป้อนหมายเลขโทรศัพท์ที่ถูกต้อง โดยใช้เฉพาะตัวเลขเท่านั้น"
            });
        }

        // hashing user password 
        const salt = await bcrypt.genSalt(10); // สร้าง salt คือการสร้างข้อมูลสุ่มเพื่อใช้ในการเข้ารหัส 10 คือจำนวนรอบในการเข้ารหัส
        const hashedPassword = await bcrypt.hash(password, salt);

        // create new user
        const newUser = await userModel.create({
            username: username,
            password: hashedPassword,
            role: "Customer", // role เริ่มต้น
        });

        console.log("Creating Customer with:", { cust_name, address, phone_number, user_id: newUser.user_id });

        // create customer
        const newCustomer = await custModel.create({
            cust_name: cust_name,
            address: address,
            phone_number: phone_number,
            user_id: newUser.user_id, // ใช้ user_id จาก newUser
        });

        const role = newUser.role
        const token = createToken(newUser.user_id)
        res.json({ success: true, token, user: newUser, customer: newCustomer, role });
    } catch (error) {
        console.error("Error during registration:", error);
        res.json({ success: false, message: "เกิดข้อผิดพลาดขณะลงทะเบียน" });

    }
};


export { loginUser, registerUser };
