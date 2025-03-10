import express from "express";
import { addMenuIngredients, listMenuIngredients, removeMenuIngredient, updateMenuIngredient, calculateTotalIngredientCost } from "../controllers/tuseController.js";

const tuseRouter = express.Router();

tuseRouter.post("/addMenuIngred", addMenuIngredients);
tuseRouter.get("/listMenuIngred/:menu_id", listMenuIngredients);
tuseRouter.delete("/removeMenuIngred/:menu_id/:ingredients_id", removeMenuIngredient);
tuseRouter.put("/editMenuIngred", updateMenuIngredient);
tuseRouter.get("/cost", calculateTotalIngredientCost);

export default tuseRouter;