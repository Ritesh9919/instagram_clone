import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
