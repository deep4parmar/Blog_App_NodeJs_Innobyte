import { Comment } from "../models/Comment.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Post } from "../models/Post.js";
import { validationResult } from "express-validator";

// Read Comments Controller for One Perticular Post
const readComments = asyncHandler(async (req, res) => {

    try {
        const { postId } = req.params;

        const comments = await Comment.find({ post_id: postId });

        if (comments.length === 0) {
            throw new ApiError(404, "No Comments Found for This Post");
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, { count: comments.length, comments }, "Comments!!")
            )
    } catch (err) {
        throw new ApiError(500, err.message)
    }
})

// Read Single Comment Controller from Comment
const readSingleComment = asyncHandler(async (req, res) => {
    try {
        const { commentId } = req.params;

        const readSingleComment = await Comment.findById(commentId);

        if (!readSingleComment) {
            throw new ApiError(404, "No Comment Like This")
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, readSingleComment, "Comment!!")
            )
    } catch (err) {
        throw new ApiError(500, err.message)
    }
})

// Controller for Add a Comment in DB.
const createComment = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(401, "You must be logged in to add a post");
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).send(errors.array());
    }

    try {
        const { content } = req.body;

        const { postId } = req.params;

        if (!content) {
            throw new ApiError(401, "This Field is Required");
        }

        const post = await Post.findById(postId);

        if (!post) {
            throw new ApiError(404, "Post Not Found")
        }

        const comment = new Comment({
            post_id: postId,
            content,
            author_id: req.user._id
        })

        const savedComment = await comment.save();

        return res
            .status(201)
            .json(
                new ApiResponse(201, savedComment, "Comment Added Successfull")
            )
    } catch (err) {
        throw new ApiError(500, err.message)
    }
})

// Update Comment Controller for Update Comments
const updateComment = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(401, "You must be logged in to add a post");
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).send(errors.array());
    }

    try {
        const { commentId } = req.params

        const { content } = req.body;

        if (!content) {
            throw new ApiError(404, "Content Field is Required");
        }

        const newComment = {}

        if (content) newComment.content = content;

        let comment = await Comment.findById(commentId);
        if (!comment) throw new ApiError(404, "Not Found");

        if (comment.author_id.toString() !== req.user._id.toString()) {
            throw new ApiError(401, "Not Allowed")
        }

        comment = await Comment.findByIdAndUpdate(
            commentId,
            { $set: newComment },
            { new: true }
        )

        return res
            .status(200)
            .json(
                new ApiResponse(200, comment, "Comment Updated Successfully")
            )
    } catch (err) {
        throw new ApiError(500, err.message)
    }
})

// deleteComment Controller for Delete Comments
const deleteComment = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(401, "You must be logged in to add a post");
    }

    try {
        const { commentId } = req.params;

        let comment = await Comment.findById(commentId);
        if (!comment) throw new ApiError(404, "Not Found");

        if (comment.author_id.toString() !== req.user._id.toString()) {
            throw new ApiError(401, "Not Allowed")
        }

        comment = await Comment.findByIdAndDelete(commentId)

        return res
            .status(200)
            .json(
                new ApiResponse(200, comment, "Comment Deleted")
            )
    } catch (err) {
        throw new ApiError(500, err.message)
    }
})

export {
    createComment,
    readSingleComment,
    readComments,
    updateComment,
    deleteComment
}