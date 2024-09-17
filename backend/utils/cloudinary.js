import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (file) => {
  try {
    if (!file) return null;

    const response = await cloudinary.uploader.upload(file, {
      resource_type: "auto",
    });
    return response;
  } catch (error) {
    return null;
  }
};
