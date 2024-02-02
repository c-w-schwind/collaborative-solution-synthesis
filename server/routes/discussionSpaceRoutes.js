import express from "express";
import {DiscussionSpacePost} from "../models/discussionSpacePostModel.js";
import {User} from "../models/userModel.js";
import authenticateToken from "../middleware/authenticateToken.js";

const discussionSpaceRoutes = express.Router();

//todo:
//  - Identify modular discussion spaces
//      - Using unique IDs queried from the URL is a standard and efficient approach. Each discussion space can have its own ID as a part of the URL path or as a query parameter.
//      - Another approach could involve using slugs (human-readable identifiers) if you want more user-friendly URLs. For example, /discussionSpace/space-name instead of using numeric IDs.


// Create new Discussion Space post
discussionSpaceRoutes.post('/discussionSpace', authenticateToken, async (req, res) => {
    try {
        const { title, content, replyingTo } = req.body;
        const author = req.user._id;

        if (!title) {
            return res.status(400).send({ message: 'Missing required field: title.' });
        }
        if (!content) {
            return res.status(400).send({ message: 'Missing required field: content.' });
        }

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

        const newPostData = { title, content, author, date: new Date(), replyingTo };   //TODO: replying to optional. will be empty or missing? what is right thing to do here?
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skipIndex = (page - 1) * limit;

    try {
        const totalNumberOfPosts = await DiscussionSpacePost.countDocuments();
        const totalPages = Math.ceil(totalNumberOfPosts / limit);

        const posts = await DiscussionSpacePost.find()
            .sort({ date: -1 })
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