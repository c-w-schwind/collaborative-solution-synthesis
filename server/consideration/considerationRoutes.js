import express from "express";
import mongoose from "mongoose";
import {asyncHandler} from "../utils/asyncHandler.js";
import {BadRequestError, NotFoundError} from "../utils/customErrors.js";
import authenticateToken from "../middleware/authenticateToken.js";
import {Consideration} from "./considerationModel.js";
import {
    groupAndSortConsiderationsByStance,
    toggleCommentVote,
    toggleConsiderationVote,
    updateParentConsiderationsCount,
    validateAndCreateConsiderations,
    validateConsiderationData,
    validateParentDocument
} from "./considerationService.js";
import translateEntityNumberToId from "../middleware/translateEntityNumberToId.js";

const considerationRoutes = express.Router();


// Create new Consideration
considerationRoutes.post("/considerations", authenticateToken(), (req, res, next) => translateEntityNumberToId(req.body.parentType, req.body.parentNumber, req.body.parentVersionNumber)(req, res, next), asyncHandler(async (req, res, next) => {
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
considerationRoutes.put("/considerations/:considerationId", authenticateToken(), (req, res, next) => translateEntityNumberToId(req.body.parentType, req.body.parentNumber, req.body.parentVersionNumber, "parentId")(req, res, next), asyncHandler(async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.considerationId)) throw new BadRequestError("Invalid Consideration ID.");
    await validateConsiderationData({...req.body, parentId: req.parentId});

    const consideration = await Consideration.findByIdAndUpdate(req.params.considerationId, req.body, {new: true});
    if (!consideration) throw new NotFoundError("Consideration not found.");

    res.status(201).send(consideration);
}));


// Create a new comment for a Consideration
considerationRoutes.post("/considerations/:considerationId/comment", authenticateToken(), asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.considerationId)) throw new BadRequestError("Invalid Consideration ID.");
    if (!req.body.text) throw new BadRequestError("Consideration Comment: Missing required field: text.");

    const consideration = await Consideration.findById(req.params.considerationId);
    if (!consideration) throw new NotFoundError("Consideration not found.");

    const comment = {
        text: req.body.text,
        postedBy: req.user._id,
        createdAt: new Date()
    }

    consideration.comments.push(comment);
    await consideration.save();

    res.status(201).send(consideration);
}));


// Vote on Consideration
considerationRoutes.post("/considerations/:considerationId/vote", authenticateToken(), asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.considerationId)) throw new BadRequestError("Invalid Consideration ID.");

    const vote = req.body.vote;
    if (vote !== "upvote" && vote !== "downvote") {
        throw new BadRequestError('Invalid vote type. Expected "upvote" for upvote or "downvote" for downvote.');
    }

    const consideration = await toggleConsiderationVote(req.params.considerationId, req.user._id.toString(), vote);

    res.status(200).send(consideration);
}));


// Vote on Consideration comment
considerationRoutes.post("/considerations/:considerationId/comment/:commentId/vote", authenticateToken(), asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.considerationId)) throw new BadRequestError("Invalid Consideration ID.");
    if (!mongoose.Types.ObjectId.isValid(req.params.commentId)) throw new BadRequestError("Invalid Consideration comment ID.");

    const vote = req.body.vote;
    if (vote !== "upvote" && vote !== "downvote") {
        throw new BadRequestError('Invalid vote type. Expected "upvote" for upvote or "downvote" for downvote.');
    }

    const comment = await toggleCommentVote(req.params.considerationId, req.params.commentId, req.user._id.toString(), vote);

    res.status(200).send(comment);
}));

export default considerationRoutes;