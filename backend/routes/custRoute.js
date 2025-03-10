import express from "express";
import { updateCustomer, getCustomerByUserId } from "../controllers/custController.js";
import authMiddleware from "../middleware/auth.js";

const custRouter = express.Router();

custRouter.put("/user/:user_id", authMiddleware, updateCustomer); // อัปเดต customer
custRouter.get("/user/:user_id", authMiddleware, getCustomerByUserId); // ดึง customer ตาม user_id

export default custRouter;
