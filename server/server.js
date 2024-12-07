import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import formRoutes from "./routes/formRoutes.js";
import responseRoutes from "./routes/responseRoutes.js";
import errorHandler from "./middleware/errorMiddleware.js";
import connectDB from "./config/db.js";
import configureCloudinary from './config/cloudinary.js';

configureCloudinary();
dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/forms", formRoutes);
app.use("/api/responses", responseRoutes);

app.use(errorHandler);

/* This API is a temporary solution to address the limitations of deploying the website on a free server. 
   Since free servers automatically shut down after a period of inactivity, this API helps mitigate that issue. 
   Once the application is deployed on a paid or persistent server that doesn't shut down due to inactivity, 
   this API can be removed. ^_^ */ 
app.get("/api/wakingup", (req, res) =>{
  res.json("Server has woke up.")
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});