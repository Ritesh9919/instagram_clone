import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { connectDB } from "./config/database.js";
import errorHandlerMiddleware from "./middlewares/errorHandler.middleware.js";

// router
import userRouter from "./routes/user.route.js";
import postRouter from "./routes/post.route.js";

const PORT = 8000;

const app = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);
app.use(errorHandlerMiddleware);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(err);
  });
