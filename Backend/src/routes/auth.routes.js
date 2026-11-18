import {Router}  from "express";
import {registerValidator,loginValidator} from "../validators/auth.validator.js";
import {registerUser,loginUser,getMe,logoutUser,googleAuth,getGoogleConfig} from "../controllers/auth.controller.js";
import {verifyEmail} from "../controllers/auth.controller.js";
import {authUser} from "../middlewares/auth.middleware.js";

const authRouter = Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 * @body { username, email, password }
 */
authRouter.post("/register", registerValidator, registerUser);


/**
 * @route POSt /api/auth/login
 * @desc Login a user
 * @access Public
 * @body { email, password }
 */
authRouter.post("/login", loginValidator, loginUser);


/**
 * @route GET /api/auth/get-me
 * @desc Get the logged-in user's information
 * @access Private
 */
authRouter.get("/get-me",authUser, getMe);


/**
 * @route GET /api/auth/verify-email
 * @desc Verify user's email address
 * @access Public
 * @query { token }
 */
authRouter.get("/verify-email",verifyEmail);


/**
 * @route POST /api/auth/logout
 * @desc Clear the auth cookie
 * @access Public
 */
authRouter.post("/logout", logoutUser);


/**
 * @route GET /api/auth/google/config
 * @desc Public Google Sign-In client ID (if configured)
 * @access Public
 */
authRouter.get("/google/config", getGoogleConfig);


/**
 * @route POST /api/auth/google
 * @desc Sign in / sign up with a Google ID token
 * @access Public
 * @body { credential, remember }
 */
authRouter.post("/google", googleAuth);


export default authRouter;