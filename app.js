import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import routes from "./routes/index.js";
import passportConfig from "./middleware/passportConfig.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


//Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passportConfig.initialize());
app.use("/uploads", express.static(resolve(__dirname, "uploads")));

//Routes
app.use(routes);

//Health Check
app.get("/", (req,res) => {
    res.send("Dash Messaging API is running");
});

//Start Server
app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});