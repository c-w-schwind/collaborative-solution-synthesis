import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from 'express-rate-limit';
import {asyncHandler} from "../utils/asyncHandler.js";
import {validateEmail, validateRequiredFields} from "../utils/utils.js";
import {BadRequestError, ConflictError, NotFoundError} from "../utils/customErrors.js";
import authenticateToken from "../middleware/authenticateToken.js";
import verifyUserExistence from "../middleware/verifyUserExistence.js";
import {User} from "./userModel.js";

const userRoutes = express.Router();

const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,   // 15 minutes
    max: 5,                     // IP limit to 5 login requests per windowMs
    message: JSON.stringify({message: "Too many login attempts from this IP, please try again after 15 minutes"})
});


// Create new User
userRoutes.post('/users/register', asyncHandler(async (req, res) => {
    const {email} = req.body;

    validateEmail(email);
    validateRequiredFields(req.body, ['username', 'email', 'password'], 'User registration')

    const existingUser = await User.findOne({email});
    if (existingUser) throw new ConflictError('Email already in use.');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(req.body.password, salt);

    const user = new User({username: req.body.username, email, passwordHash});
    await user.save();

    res.status(201).send({message: 'User created successfully.'});
}));


// Login User
userRoutes.post('/users/login', loginRateLimiter, asyncHandler(async (req, res) => {
    const user = await User.findOne({email: req.body.email});
    if (!user) throw new NotFoundError('User not found.');

    const isMatch = await bcrypt.compare(req.body.password, user.passwordHash);
    if (!isMatch) throw new BadRequestError('Invalid credentials.');

    const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});

    const userForResponse = {
        _id: user._id,
        username: user.username,
        email: user.email
    };

    loginRateLimiter.resetKey(req.ip);

    res.status(200).header('auth-token', token).send({user: userForResponse, token});
}));


// Retrieve User
userRoutes.get('/users/:id', authenticateToken, verifyUserExistence, asyncHandler(async (req, res) => {
    const userID = req.params.id;

    const user = await User.findById(userID).select('-passwordHash');
    if (!user) throw new NotFoundError('User not found.');

    res.status(200).send(user);
}));

export default userRoutes;