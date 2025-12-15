import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(registerUser)
router.post("/test", (req, res) => {
    res.json({ message: "TEST WORKING" });
});


export default router;