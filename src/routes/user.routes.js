import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import upload from "../middleware/multer.middleware.js";
import multer from "multer";

const router = Router();

router.route("/register").post(
    upload.fields([
        { name: 'avatar', maxCount: 1 },
        { name: 'coverImages', maxCount: 1 }
    ])
    ,registerUser)



export default router;