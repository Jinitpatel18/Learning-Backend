import express from "express";
import connectDB from "./db/index.js";
import dotenv from "dotenv";

dotenv.config({
    path: './.env'
});

// requires('dotenv').config({
//     path: './.env'
// });
connectDB();

const app = express();

// (async () => {
//     try {
//         await mongoose.connect(process.env.MONGODB_URL, { dbName: DB_NAME });
//         console.log("Connected to MongoDB");
//         app.listen(process.env.PORT, () => {
//             console.log(`Server is running on port ${process.env.PORT}`);
//         });
//     } catch (error) {
//         console.log('Error',error.message);
//         throw error;
//     }
// })
