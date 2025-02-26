import express from "express";
import {asyncHandler} from "../utils/asyncHandler.js";
import {NotFoundError} from "../utils/customErrors.js";
import {validateRequiredFields} from "../utils/utils.js";
import authenticateToken from "../middleware/authenticateToken.js";
import {DiscussionSpacePost} from "./discussionSpacePostModel.js";
import {User} from "../user/userModel.js";
import {getEstablishedEntityVersionNumber} from "./discussionSpaceService.js";

const discussionSpaceRoutes = express.Router();


// Create new Discussion Space post
discussionSpaceRoutes.post("/discussionSpace", authenticateToken(), asyncHandler(async (req, res) => {
    validateRequiredFields(req.body, ["title", "content", "parentType", "parentNumber"], "Discussion Space Post");

    if (!req.body.parentVersion) {
        req.body.parentVersion = await getEstablishedEntityVersionNumber(req.body.parentType, req.body.parentNumber);
    }

    if (req.body.replyingTo) {
        const existingPost = await DiscussionSpacePost.findById(req.body.replyingTo);
        if (!existingPost) throw new NotFoundError("Replying to a non-existent post.");
    }

    const newPostData = {
        ...req.body,
        author: req.user._id
    };

    const newPost = await DiscussionSpacePost.create(newPostData);
    return res.status(201).send(newPost);
}));


// Get Discussion Space posts
discussionSpaceRoutes.get("/discussionSpace", asyncHandler(async (req, res) => {
    let {page = 1, limit = 30, parentType, parentNumber, parentVersion} = req.query;
    limit = Number(limit);

    if (!parentType || !parentNumber) {
        return res.status(400).json({error: "parentType and parentNumber are required."});
    }

    // In case of direct url access of an established entity's discussion space, parentVersion will be undefined
    let resolvedParentVersion = parentVersion || await getEstablishedEntityVersionNumber(parentType, parentNumber);

    const query = {parentType, parentNumber, parentVersion: resolvedParentVersion};

    const totalNumberOfPosts = await DiscussionSpacePost.countDocuments(query);
    const totalPages = Math.ceil(totalNumberOfPosts / limit) || 1;

    page = page === "last" ? totalPages : Number(page);

    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;

    const skipIndex = (page - 1) * limit;

    const posts = await DiscussionSpacePost.find(query)
        .sort({createdAt: 1})
        .limit(limit)
        .skip(skipIndex)
        .populate("author", "username avatarUrl", "User")
        .populate({
            path: "replyingTo",
            populate: {
                path: "author",
                model: "User",
                select: "username avatarUrl"
            }
        });

    res.status(200).send({posts, totalPages});
}));


export default discussionSpaceRoutes;