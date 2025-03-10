import express from "express";
import { getSettings, updateSettings } from "../controllers/settingsController.js";

const settingsRoute = express.Router();

settingsRoute.get("/", getSettings);
settingsRoute.put("/", updateSettings);

export default settingsRoute;
