import express from "express";
import { User } from "./userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import authenticateToken from "../middleware/authenticateToken.js";

const userRoutes = express.Router();


userRoutes.post('/users/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).send({ message: 'Missing required fields: username, email, and password.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send({ message: 'Email already in use.' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = new User({ username, email, passwordHash });
        await user.save();

        res.status(201).send({ message: 'User created successfully.' });
    } catch (err) {
        console.log(err);
        if (err.name === 'ValidationError') {
            return res.status(400).send({ message: err.message });
        }
        res.status(500).send({ message: 'Internal server error' });
    }
});

userRoutes.post('/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send({ message: 'User not found.' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).send({ message: 'Invalid credentials.' });
        }

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        const userForResponse = {
            _id: user._id,
            username: user.username,
            email: user.email
        };

        res.status(200).header('auth-token', token).send({ user: userForResponse, token });

    } catch (err) {
        console.log(err);
        if (err.name === 'ValidationError') {
            return res.status(400).send({ message: err.message });
        }
        res.status(500).send({ message: 'Internal server error' });
    }
});

userRoutes.get('/users/:id', authenticateToken, async (req, res) => {
    try {
        const userID = req.params.id;
        const user = await User.findById(userID).select('-passwordHash');

        if (!user) {
            return res.status(404).send({ message: 'User not found.' });
        }

        res.status(200).send(user);

    } catch (err) {
        console.log(err);
        if (err.name === 'ValidationError') {
            return res.status(400).send({ message: err.message });
        }
        res.status(500).send({ message: 'Internal server error' });
    }
});

export default userRoutes;