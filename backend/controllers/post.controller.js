import sharp from "sharp";
import { Post } from "../models/post.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";

export const createPost = async (req, res, next) => {
  try {
    const { caption } = req.body;
    const image = req.file;
    if (!caption) {
      return next(new ApiError("Caption is required", 400));
    }
    if (!image) {
      return next(new ApiError("Image file is required"));
    }
    const optimizedImageBuffer = await sharp(image.buffer)
      .resize({
        width: 800,
        height: 800,
        fit: "inside",
      })
      .toFormat("jpeg", { quality: 80 })
      .toBuffer();

    const imageUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString(
      "base64"
    )}`;

    const cloudinaryResponse = await uploadOnCloudinary(imageUri);
    const post = await Post.create({
      caption,
      image: cloudinaryResponse.secure_url,
      author: req.user.userId,
    });
    const user = await User.findById(req.user.userId);
    if (user) {
      user.posts.push(post._id);
      await user.save();
    }
    await post.populate({ path: "author", select: "-password" });
    return res
      .status(201)
      .json(new ApiResponse(true, "Post created successfully", post));
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getAllPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .populate({ path: "author", select: "username profilePicture" })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: {
          path: "author",
          select: "username profilePicture",
        },
      });
    return res
      .status(200)
      .json(new ApiResponse(true, "Post fetched successfully", posts));
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getUserPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ author: req.user.userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "author",
        select: "username profilePicture",
      })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: {
          path: "author",
          select: "username profilePicture",
        },
      });
    return res
      .status(200)
      .json(new ApiResponse(true, "User posts fetched successfully", posts));
  } catch (error) {
    next(error);
  }
};

export const likePost = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) {
      return next(new ApiError("Post not found", 404));
    }
    await post.updateOne({ $addToSet: { likes: userId } });
    await post.save();
    //implementing socket for real time notification
    return res.status(200).json(new ApiResponse(true, "Post Liked"));
  } catch (error) {
    next(error);
  }
};

export const dislikePost = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) {
      return next(new ApiError("Post not found", 404));
    }
    await post.updateOne({ $pull: { likes: userId } });
    await post.save();
    //implementing socket for real time notification
    return res.status(200).json(new ApiResponse(true, "Post disLiked"));
  } catch (error) {
    next(error);
  }
};

export const addCommentOnPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { userId } = req.user;
    const { text } = req.body;

    if (!text) {
      return next(new ApiError("Text is required", 400));
    }
    const post = await Post.findById(postId);
    if (!post) {
      return next(new ApiError("Post not found", 404));
    }
    const comment = await Comment.create({
      text,
      author: userId,
      post: postId,
    });

    await comment.populate({
      path: "author",
      select: "username profilePicture",
    });
    post.comments.push(comment._id);
    await post.save();
    return res
      .status(200)
      .json(new ApiResponse(true, "Comment added", comment));
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getCommentOfPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) {
      return next(new ApiError("Post not found", 404));
    }
    const comments = await Comment.find({ post: postId }).populate({
      path: "author",
      select: "username profilePicture",
    });
    if (!comments) {
      return next(new ApiError("Comment not found", 404));
    }
    return res
      .status(200)
      .json(new ApiResponse(true, "Comments fetched successfully", comments));
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { userId } = req.user;
    const post = await Post.findById(postId);
    if (!post) {
      return next(new ApiError("Post not found", 404));
    }
    if (post.author.toString() !== userId) {
      return next(new ApiError("You can't delete this post", 401));
    }
    await Post.findByIdAndDelete(postId);
    const user = await User.findById(userId);
    if (user) {
      user.posts = user.posts.filter((id) => id.toString() !== postId);
      await user.save();
    }
    await Comment.deleteMany({ post: postId });
    return res.status(200).json(new ApiResponse(true, "Post deleted"));
  } catch (error) {
    next(error);
  }
};

export const bookMarkPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { userId } = req.user;
    const post = await Post.findById(postId);
    if (!post) {
      return next(new ApiError("Post not found", 404));
    }
    const user = await User.findById(userId);
    if (user.bookmarks.includes(postId)) {
      await user.updateOne({ $pull: { bookmarks: postId } });
      await user.save();
      return res.status(200).json(new ApiResponse(true, "Post unsaved"));
    } else {
      await user.updateOne({ $addToSet: { bookmarks: postId } });
      await user.save();
      return res.status(200).json(new ApiResponse(true, "Post saved"));
    }
  } catch (error) {
    next(error);
  }
};
