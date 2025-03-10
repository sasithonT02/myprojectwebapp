import express from "express";
import { addMenu, listMenu, removeMenu, editMenu, listMenuSeller } from "../controllers/menuController.js";
import multer from "multer"; // multer คือ middleware ที่ใช้ในการอัพโหลดไฟล์

const menuRouter = express.Router();

// Image Storage Engine

const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}${file.originalname}`)
    }
});

const upload = multer({ storage: storage });

menuRouter.post("/add", upload.single("image"), addMenu);
menuRouter.get("/list", listMenu);
menuRouter.get("/listseller", listMenuSeller);
menuRouter.post("/remove", removeMenu);
menuRouter.post("/edit", upload.single("image"), editMenu);


export default menuRouter;