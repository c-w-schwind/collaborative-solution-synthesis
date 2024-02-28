import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { NotFoundError } from "../utils/customErrors.js";
import { validateRequiredFields } from "../utils/utils.js";
import authenticateToken from "../middleware/authenticateToken.js";
import verifyUserExistence from "../middleware/verifyUserExistence.js";
import { DiscussionSpacePost } from "./discussionSpacePostModel.js";
import { User } from "../user/userModel.js";

const discussionSpaceRoutes = express.Router();


// Create new Discussion Space post
discussionSpaceRoutes.post('/discussionSpace', authenticateToken, verifyUserExistence, asyncHandler(async (req, res) => {
    validateRequiredFields(req.body, ['title', 'content', 'parentType', 'parentId'], 'Discussion Space Post');

    if (req.body.replyingTo) {
        const existingPost = await DiscussionSpacePost.findById(req.body.replyingTo);
        if (!existingPost) throw new NotFoundError('Replying to a non-existent post.');
    }

    const newPostData = {
        ...req.body,
        author: req.user._id
    };

    const newPost = await DiscussionSpacePost.create(newPostData);
    return res.status(201).send(newPost);
}));


// Get Discussion Space posts
discussionSpaceRoutes.get('/discussionSpace', asyncHandler(async (req, res) => {
    const {page = 1, limit = 30, parentType, parentId} = req.query;
    const skipIndex = (page - 1) * limit;

    const query = {parentType, parentId};
    const totalNumberOfPosts = await DiscussionSpacePost.countDocuments(query);
    const totalPages = Math.ceil(totalNumberOfPosts / limit);

    const posts = await DiscussionSpacePost.find(query)
        .sort({createdAt: -1})
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

    res.status(200).send({posts, totalPages});
}));

export default discussionSpaceRoutes;