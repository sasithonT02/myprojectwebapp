import express from "express";
import { addIngredient, listIngredient, removeIngredient, editIngredient } from "../controllers/ingredientController.js";

const ingredientRouter = express.Router();

ingredientRouter.post("/addIngred", addIngredient);
ingredientRouter.get("/listIngred", listIngredient);
ingredientRouter.post("/removeIngred", removeIngredient);
ingredientRouter.put("/editIngred", editIngredient);

export default ingredientRouter;