import express from "express";
const router = express.Router();
import {
  register,
  login,
  logout,
  getProfile,
  editProfile,
  getSuggestedUser,
  followUnfollowUser,
} from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
router.post("/register", register);
router.post("/login", login);
router.post("/logout", verifyJwt, logout);
router.get("/getProfile/:userId", verifyJwt, getProfile);
router.put(
  "/updateProfile/:userId",
  upload.single("profilePicture"),
  verifyJwt,
  editProfile
);
router.get("/getSuggestedUser", verifyJwt, getSuggestedUser);
router.post("/follow-unfollow/:userId", verifyJwt, followUnfollowUser);

export default router;
