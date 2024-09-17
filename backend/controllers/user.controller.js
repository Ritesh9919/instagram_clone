import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import getDataUri from "../utils/dataUri.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return next(new ApiError("All the fields are required", 400));
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ApiError("User already exist", 400));
    }
    await User.create({ username, email, password });
    return res
      .status(201)
      .json(new ApiResponse(true, "Account created successfully"));
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ApiError("Both fields are required", 400));
    }
    const user = await User.findOne({ email }).select("-password");
    if (!user) {
      return next(new ApiError("User not found", 404));
    }
    const isPasswordCurrect = await user.comparePassword(password);
    if (!isPasswordCurrect) {
      return next(new ApiError("Invalid Credentials", 401));
    }
    const token = await user.generateToken();
    return res
      .cookie("token", token, {
        httpOnly: true,
        expires: 1 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json(new ApiResponse(true, "Login successfully", user));
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    return res
      .clearCookie("token")
      .status(200)
      .json(new ApiResponse(true, "Logout successfully"));
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    return res
      .status(200)
      .json(new ApiResponse(true, "User profile fetched successfully", user));
  } catch (error) {
    next(error);
  }
};

export const editProfile = async (req, res, next) => {
  try {
    const { bio, gender } = req.body;
    const profilePicture = req.file;
    if (req.user.userId !== req.params.userId) {
      return next(
        new ApiError("You are not allowed to edit this profile", 403)
      );
    }
    const user = await User.findById(req.params.userId);
    if (!user) {
      return next(new ApiError("User not found", 404));
    }
    let cloudinaryResponse;
    if (profilePicture) {
      const fileUri = getDataUri(profilePicture);
      cloudinaryResponse = await uploadOnCloudinary(fileUri);
    }

    if (bio) {
      user.bio = bio;
    }
    if (gender) {
      user.gender = gender;
    }
    if (profilePicture) {
      user.profilePicture = cloudinaryResponse.secure_Url;
    }
    await user.save();
    return res
      .status(200)
      .json(new ApiResponse(true, "Profile updated successfully", user));
  } catch (error) {
    next(error);
  }
};

export const getSuggestedUser = async (req, res, next) => {
  try {
    const suggestedUsers = await User.find({
      _id: { $ne: req.user.userId },
    }).select("-password");
    if (!suggestedUsers) {
      return next(new ApiError("Currently not have suggested users", 404));
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          true,
          "Suggested users fetched successfully",
          suggestedUsers
        )
      );
  } catch (error) {
    next(error);
  }
};

export const followUnfollowUser = async (req, res, next) => {
  try {
    const myId = req.user.userId;
    const userId = req.params.userId;
    if (myId === userId) {
      return next(new ApiError("You can't follow/unfollow yourself", 400));
    }
    const user = await User.findById(myId);
    const targetUser = await User.findById(userId);
    if (!user || !targetUser) {
      return next(new ApiError("User not found"));
    }
    const isFollowing = user.following.includes(userId);
    if (isFollowing) {
      await Promise.all([
        User.updateOne({ _id: myId }, { $pull: { following: userId } }),
        User.updateOne({ _id: userId }, { $pull: { followers: myId } }),
      ]);
      return res
        .status(200)
        .json(new ApiResponse(true, "InFollowed successfully"));
    } else {
      await Promise.all([
        User.updateOne({ _id: myId }, { $push: { following: userId } }),
        User.updateOne({ _id: userId }, { $push: { followers: myId } }),
      ]);
      return res
        .status(200)
        .json(new ApiResponse(true, "Followed successfully"));
    }
  } catch (error) {
    next(error);
  }
};
