import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
    const { authorization } = req.headers; // ดึงค่า Authorization จาก headers header คือส่วนที่ส่งมากับ request โดยมี key และ value
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
        //ถ้าพบ token จะทำการ decode ด้วย jwt.verify โดยใช้ JWT_SECRET ที่เรากำหนดไว้ใน .env
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { user_id: token_decode.user_id }; // เก็บข้อมูล user_id ใน req.user

        next(); // ไปยัง middleware หรือ route ถัดไป
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};


export default authMiddleware;
