import express from "express";
import cors from "cors";
import menuRouter from "./routes/menuRoute.js";
import userRouter from "./routes/userRoute.js";
import 'dotenv/config';
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import custRouter from "./routes/custRoute.js";
import ingredientRouter from "./routes/ingredientRoute.js";
import tuseRouter from "./routes/tuseRoute.js";
import settingsRoute from "./routes/settingsRoute.js";


// app config
const app = express();
const port = 4000;


// middleware
app.use(express.json());
app.use(cors());


// api endpoints
app.use("/api/menu", menuRouter);
app.use("/images", express.static('uploads'));
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/customer", custRouter);
app.use("/api/ingredient", ingredientRouter);
app.use("/api/tuse", tuseRouter);
app.use("/api/settings", settingsRoute);


// ทดสอบว่า backend ทำงานไหม
app.get("/api", (req, res) => {
    res.send("API Working")
});


app.listen(port, () => {
    console.log(`Server Started on http://localhost:${port}`)
});