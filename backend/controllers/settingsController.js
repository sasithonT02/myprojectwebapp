import fs from "fs";
import path from "path";

const configPath = path.join(process.cwd(), "config.json");

// โหลดค่า config ปัจจุบัน
const getSettings = (req, res) => {
    try {
        const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
        res.json(config);
    } catch (error) {
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการโหลดค่า" });
    }
};

// อัปเดตค่าเวลาเปิด-ปิดร้าน
const updateSettings = (req, res) => {
    try {
        const { open_time, close_time } = req.body;
        const config = { open_time, close_time };

        // เขียนค่าใหม่ลงไฟล์
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

        res.json({ success: true, message: "อัปเดตเวลาสำเร็จ" });
    } catch (error) {
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการบันทึกค่า" });
    }
};

export { getSettings, updateSettings };