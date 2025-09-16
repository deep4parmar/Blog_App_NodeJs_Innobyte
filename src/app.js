import express from "express";
import cookieParser from "cookie-parser";
const app = express();
import cors from "cors";

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Routes Import
import userRouter from "./routes/user.routes.js";
import postRouter from "./routes/post.routes.js";
import commentRouter from "./routes/comment.routes.js";

// Routes Declaration
app.use("/api/users", userRouter);
app.use("/api/post", postRouter);
app.use("/api/comment", commentRouter);

export default app;