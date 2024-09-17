import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";

export const verifyJwt = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return next(new ApiError("Unauthorized", 401));
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return next(new ApiError("Invalid token", 401));
      }
      req.user = user;
      next();
    });
  } catch (error) {
    next(error);
  }
};
