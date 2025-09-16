import express from "express";
import {
    getPosts,
    addPost,
    getPost,
    updatePost,
    deletePost
} from "../controllers/post.controller.js"
import { verifyJWT } from "../middleware/authentication.js";
import { body } from "express-validator";

const router = express.Router();

router.route("/getposts").get(getPosts);

router.route("/addpost").post(verifyJWT,
    [
        body("title", "Enter a Valid Title").isLength({ min: 3 }),
        body("content", "Enter a Valid Content").isLength({ min: 4 }),
    ],
    addPost);

router.route("/getpost/:postId").get(getPost);

router.route("/updatepost/:id").put(verifyJWT,
    [
        body("title", "Enter a Valid Title").isLength({ min: 3 }),
        body("content", "Enter a Valid Content").isLength({ min: 4 }),
    ],
    updatePost);

router.route("/deletepost/:id").delete(verifyJWT, deletePost);

export default router;