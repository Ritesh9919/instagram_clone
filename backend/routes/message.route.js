import express from "express";
const router = express.Router();
import { sendMessage, getMessages } from "../controllers/message.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

router.post("/send/:recieverId", verifyJwt, sendMessage);
router.get("/all/:recieverId", verifyJwt, getMessages);

export default router;
