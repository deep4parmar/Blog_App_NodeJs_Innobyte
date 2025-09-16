import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { validationResult } from "express-validator";
import { ApiResponse } from "../utils/ApiResponse.js";

// Generating a AccessToken
const generateAccessToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        return accessToken;
    } catch (err) {
        throw new ApiError(
            500,
            "Something went wrong while generating Access Token"
        )
    }
}

// Register a User
const registerUser = asyncHandler(async (req, res) => {
    // Validation using express-validator
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).send(errors.array());
    }

    const { username, email, password } = req.body;

    // check for fields Requirement
    if (
        [username, email, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All Fields are Required");
    }

    // check for user is already exists or not
    const exitedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (exitedUser) {
        throw new ApiError(409, "User with this Email or Username Exists");
    }

    // Create User in DB.
    const user = await User.create({
        username,
        email,
        password
    });

    const createdUser = await User.findById(user._id).select("-password");

    // Generate Access Token
    const accessToken = await generateAccessToken(user._id);

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering User");
    }

    return res
        .status(201)
        .json(new ApiResponse(
            201,
            { user: createdUser, accessToken },
            "User Registered Successfully"));
})

// Login a User
const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    // check for Username or Email
    if (!username && !email) {
        throw new ApiError(400, "Username or Email is Required");
    }

    // Check for Username or Email Exists or Not.
    const user = await User.findOne({
        $or: [{ username }, { email }],
    })

    if (!user) {
        throw new ApiError(404, "User does not Exist");
    }

    // check for Password Correction
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid User Credentials");
    }

    // Generating a Access Token for Login
    const accessToken = await generateAccessToken(user._id);

    const loggedInUser = await User.findById(user._id).select(
        "-password"
    )

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiResponse(200, { user: loggedInUser, accessToken }, "User LoggedIn Successfully")
        )
})

// GET LoggedIn User Details
const getCurrentUser = asyncHandler(async (req, res) => {
    /*
    const userId = req.user._id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "User Fetched Successfully")
        )
    */

    return res
        .status(200)
        .json(
            new ApiResponse(200, req.user, "User Fetched Successfully")
        )
})

export {
    registerUser,
    loginUser,
    getCurrentUser
}