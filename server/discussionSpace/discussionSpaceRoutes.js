import express from "express";
import {DiscussionSpacePost} from "./discussionSpacePostModel.js";
import {User} from "../user/userModel.js";
import authenticateToken from "../middleware/authenticateToken.js";
import {validateRequiredFields} from "../utils.js";

const discussionSpaceRoutes = express.Router();

// Create new Discussion Space post
discussionSpaceRoutes.post('/discussionSpace', authenticateToken, async (req, res) => {
    try {
        const { title, content, replyingTo, parentType, parentId } = req.body;
        const author = req.user._id;

        validateRequiredFields(req.body, ['title', 'content', 'parentType', 'parentId'], 'Discussion Space Post')

        const existingUser = await User.findById(author);
        if (!existingUser) {
            return res.status(404).send({ message: 'User not found.' });
        }

        if (replyingTo) {
            const existingPost = await DiscussionSpacePost.findById(replyingTo);
            if (!existingPost) {
                return res.status(404).send({ message: 'Replying to a non-existent post.' });
            }
        }

        const newPostData = { title, content, author, replyingTo, parentType, parentId };
        const newPost = await DiscussionSpacePost.create(newPostData);
        return res.status(201).send(newPost);
    } catch (err) {
        console.log(err);
        if (err.name === 'ValidationError') {
            return res.status(400).send({ message: err.message });
        }
        res.status(500).send({ message: 'Internal server error' });
    }
});



// Get Discussion Space posts
discussionSpaceRoutes.get('/discussionSpace', async (req, res) => {
    const { page = 1, limit = 30, parentType, parentId } = req.query;
    const skipIndex = (page - 1) * limit;

    try {
        const query = { parentType, parentId };
        const totalNumberOfPosts = await DiscussionSpacePost.countDocuments(query);
        const totalPages = Math.ceil(totalNumberOfPosts / limit);

        const posts = await DiscussionSpacePost.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skipIndex)
            .populate('author', 'username', 'User')
            .populate({
                path: 'replyingTo',
                populate: {
                    path: 'author',
                    model: 'User',
                    select: 'username'
                }
            });

        res.status(200).send({ posts, totalPages });
    } catch (err) {
        console.log(err);
        if (err.name === 'ValidationError') {
            return res.status(400).send({ message: err.message });
        }
        res.status(500).send({ message: 'Internal server error' });
    }
});

export default discussionSpaceRoutes;