import express from "express";
import mongoose from "mongoose";
import {Consideration} from "./considerationModel.js";
import {
    toggleCommentVote,
    toggleConsiderationVote,
    updateParentConsiderationsCount,
    validateAndCreateConsiderations,
    validateConsiderationData,
    validateParentDocument
} from "./considerationService.js";
import {requiredAuth} from "../middleware/authenticateToken.js";
import authorizeAccess from "../middleware/authorizeAccess.js";
import translateEntityNumberToId from "../middleware/translateEntityNumberToId.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {BadRequestError, NotFoundError} from "../utils/customErrors.js";

const considerationRoutes = express.Router();


// Create new Consideration
considerationRoutes.post("/considerations", requiredAuth, (req, res, next) => translateEntityNumberToId(req.body.parentType, req.body.parentNumber, req.body.parentVersionNumber)(req, res, next), (req, res, next) => authorizeAccess(req.body.parentType)(req, res, next), asyncHandler(async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        await validateParentDocument(req.body.parentType, req.entityId);

        const consideration = await validateAndCreateConsiderations(req.body, req.body.parentType, req.entityId, req.user._id, session);
        await updateParentConsiderationsCount(req.body.parentType, req.entityId, 1, session);

        await session.commitTransaction();
        res.status(201).send(consideration[0]);
    } catch (err) {
        await session.abortTransaction();
        next(err);
    } finally {
        await session.endSession();
    }
}));


// Update an existing Consideration
considerationRoutes.put("/considerations/:considerationId", requiredAuth, (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.considerationId)) return next(new BadRequestError("Invalid Consideration ID."));

    req.entityId = req.params.considerationId;
    next();
}, authorizeAccess("Consideration", {requireAuthor: true}), asyncHandler(async (req, res) => {
    const {title, description, stance} = req.body;
    const updatedFields = {title, description, stance};

    validateConsiderationData({
        ...updatedFields,
        parentType: req.entity.parentType,
        parentId: req.entity.parentId
    });

    const consideration = await Consideration.findByIdAndUpdate(req.entity._id, {$set: updatedFields}, {new: true, runValidators: true});
    if (!consideration) throw new NotFoundError("Consideration not found.");

    res.status(200).send(consideration);
}));


const loadConsideration = asyncHandler(async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.considerationId)) throw new BadRequestError("Invalid Consideration ID.");

    req.consideration = await Consideration.findById(req.params.considerationId);
    if (!req.consideration) throw new NotFoundError("Consideration not found.");

    req.entityId = req.consideration.parentId;

    next();
});


// Create a new comment for a Consideration
considerationRoutes.post("/considerations/:considerationId/comment", requiredAuth, loadConsideration, (req, res, next) => authorizeAccess(req.consideration.parentType)(req, res, next), asyncHandler(async (req, res) => {
    const text = req.body?.text;

    if (typeof text !== "string" || !text.trim()) {
        throw new BadRequestError("Comment text must be a non-empty string.");
    }

    req.consideration.comments.push({
        text: text.trim(),
        postedBy: req.user._id
    });

    await req.consideration.save();

    res.status(201).send(req.consideration);
}));


// Vote on Consideration
considerationRoutes.post("/considerations/:considerationId/vote", requiredAuth, loadConsideration, (req, res, next) => authorizeAccess(req.consideration.parentType)(req, res, next), asyncHandler(async (req, res) => {
    const vote = req.body.vote;
    if (vote !== "upvote" && vote !== "downvote") {
        throw new BadRequestError('Invalid vote type. Expected "upvote" for upvote or "downvote" for downvote.');
    }

    const consideration = await toggleConsiderationVote(req.consideration, req.user._id.toString(), vote);

    res.status(200).send(consideration);
}));


// Vote on Consideration comment
considerationRoutes.post("/considerations/:considerationId/comment/:commentId/vote", requiredAuth, loadConsideration, (req, res, next) => authorizeAccess(req.consideration.parentType)(req, res, next), asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.commentId)) throw new BadRequestError("Invalid Consideration comment ID.");

    const vote = req.body.vote;
    if (vote !== "upvote" && vote !== "downvote") {
        throw new BadRequestError('Invalid vote type. Expected "upvote" for upvote or "downvote" for downvote.');
    }

    const comment = await toggleCommentVote(req.consideration, req.params.commentId, req.user._id.toString(), vote);

    res.status(200).send(comment);
}));

export default considerationRoutes;