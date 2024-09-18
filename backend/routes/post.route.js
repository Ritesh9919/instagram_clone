import express from "express";
const router = express.Router();
import { createPost } from "../controllers/post.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

router.post("/create", verifyJwt, upload.single("image"), createPost);

export default router;
