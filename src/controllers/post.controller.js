import { Post } from "../models/Post.js";
import { validationResult } from "express-validator";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Read Posts
const getPosts = asyncHandler(async (req, res) => {

    try {
        // const posts = await Post.find({ author_id: req.user._id });

        const posts = await Post.find();

        return res
            .status(200)
            .json(
                new ApiResponse(200, posts, "All Post Fetched Successfully")
            )
    } catch (err) {
        throw new ApiError(500, err.message)
    }
})

// Add a Post
const addPost = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(401, "You must be logged in to add a post");
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).send(errors.array());
    }

    try {
        const { title, content } = req.body;

        if (
            [title, content].some((field) => field?.trim() === "")
        ) {
            throw new ApiError(400, "All Fields are Required");
        }

        const post = new Post({
            title,
            content,
            author_id: req.user._id
        })

        const savedPost = await post.save();

        return res
            .status(201)
            .json(
                new ApiResponse(200, savedPost, "Posts Added Successfully")
            )
    } catch (err) {
        throw new ApiError(500, err.message)
    }
})

// get a single post
const getPost = asyncHandler(async (req, res) => {
    try {
        const { postId } = req.params

        const post = await Post.findById(postId)

        return res
            .status(200)
            .json(
                new ApiResponse(200, post, "Post Fetched Successfully")
            )
    } catch (err) {
        throw new ApiError(500, err.message)
    }
})

// Update Post
const updatePost = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(401, "You must be logged in to add a post");
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).send(errors.array());
    }

    try {
        const id = req.params.id;

        const { title, content } = req.body

        if (
            [title, content].some((field) => field?.trim() === "")
        ) {
            throw new ApiError(400, "All Fields are Required");
        }

        const newPost = {}

        if (title) newPost.title = title;
        if (content) newPost.content = content;

        let post = await Post.findById(id)
        if (!post) throw new ApiError(404, "Not Found");

        if (post.author_id.toString() !== req.user._id.toString()) {
            throw new ApiError(401, "Not Allowed");
        }

        post = await Post.findByIdAndUpdate(
            id,
            { $set: newPost },
            { new: true }
        )

        return res
            .status(201)
            .json(
                new ApiResponse(200, post, "Post Updated Successfully")
            )
    } catch (err) {
        throw new ApiError(500, err.message)
    }
})

// Delete Post
const deletePost = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(401, "You must be logged in to delete a post");
    }

    try {
        const id = req.params.id;

        let post = await Post.findById(id);
        if (!post) throw new ApiError(404, "Not Found");

        if (post.author_id.toString() !== req.user._id.toString()) {
            throw new ApiError(401, "Not Allowed");
        }

        post = await Post.findByIdAndDelete(id);

        return res
            .status(200)
            .json(
                new ApiResponse(200, post, "This Post Deleted Successfuly")
            )
    } catch (err) {
        throw new ApiError(500, err.message)
    }
})

export {
    getPosts,
    addPost,
    getPost,
    updatePost,
    deletePost
}