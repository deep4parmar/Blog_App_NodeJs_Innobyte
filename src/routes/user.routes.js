import express from "express";
import {
    registerUser,
    loginUser,
    getCurrentUser
} from "../controllers/user.controller.js"
import { body } from "express-validator";
import { verifyJWT } from "../middleware/authentication.js";

const router = express.Router();

router.route("/register").post(
    [
        body("username", "Enter a Valid Name").isLength({ min: 3 }),
        body("email", "Enter a Valid Email").isEmail(),
        body("password", "Enter a Valid Password").isLength({ min: 5 })
    ],
    registerUser
);

router.route("/login").post(
    [
        body("username", "Enter a Valid Username").isLength({ min: 3 }),
        body("email", "Enter a Valid Email").isEmail(),
        body("password", "Enter a Valid Password").isLength({ min: 5 })
    ],
    loginUser
);

router.route("/current-user").get(verifyJWT, getCurrentUser);

export default router;