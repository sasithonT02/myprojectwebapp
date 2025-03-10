import express from "express";
import authMiddleware from "../middleware/auth.js";
import checkCustomerExistence from "../middleware/authCust.js";
import { createOrder, getOrders, getAllOrders, updateOrder, deleteOrder, getIngredientUsage, getOrderSummary } from "../controllers/orderController.js";

const orderRouter = express.Router();

orderRouter.post("/addOrder", authMiddleware, createOrder);
orderRouter.get("/listOrder", checkCustomerExistence, getOrders);
orderRouter.get("/getAllOrder", authMiddleware, getAllOrders);
orderRouter.put("/editOrder/:id", authMiddleware, updateOrder);
orderRouter.delete("/removeOrder/:id", authMiddleware, deleteOrder);
orderRouter.get("/ingredientUsage", authMiddleware, getIngredientUsage);
orderRouter.get("/summary", authMiddleware, getOrderSummary);

export default orderRouter;