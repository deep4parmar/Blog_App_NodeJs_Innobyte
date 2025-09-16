import express from "express";
import { verifyJWT } from "../middleware/authentication.js";
import {
    createComment,
    readSingleComment,
    readComments,
    updateComment,
    deleteComment
} from "../controllers/comment.controller.js";
import { body } from "express-validator";

const router = express.Router();

router.route("/readsinglecomm/:commentId").get(readSingleComment);

router.route("/comments/:postId").get(readComments);

router.route("/addcomment/:postId").post(verifyJWT,
    [
        body('content', "Enter a Valid Content").isLength({ min: 3 })
    ],
    createComment);

router.route("/updatecomment/:commentId").put(verifyJWT,
    [
        body('content', "Enter a Valid Content").isLength({ min: 3 })
    ],
    updateComment);

router.route("/deletecomment/:commentId").delete(verifyJWT, deleteComment);

export default router;