import sharp from "sharp";
import { Post } from "../models/post.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { getDataUri } from "../utils/dataUri.js";

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
    return res
      .status(201)
      .json(new ApiResponse(true, "Post created successfully", post));
  } catch (error) {
    console.log(error);
    next(error);
  }
};
