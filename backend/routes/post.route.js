import express from "express";
const router = express.Router();
import {
  addCommentOnPost,
  bookMarkPost,
  createPost,
  deletePost,
  dislikePost,
  getAllPosts,
  getCommentOfPost,
  getUserPosts,
  likePost,
} from "../controllers/post.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

router.post("/create", verifyJwt, upload.single("image"), createPost);
router.get("/getAllPosts", getAllPosts);
router.get("/getUserPosts", verifyJwt, getUserPosts);
router.post("/like/:postId", verifyJwt, likePost);
router.post("/disLike/:postId", verifyJwt, dislikePost);
router.post("/addComment/:postId", verifyJwt, addCommentOnPost);
router.get("/getComments/:postId", verifyJwt, getCommentOfPost);
router.delete("/delete/:postId", verifyJwt, deletePost);
router.post("/bookMark/:postId", verifyJwt, bookMarkPost);

export default router;
