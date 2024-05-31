import express from "express";
import mongoose from "mongoose";
import {asyncHandler} from "../utils/asyncHandler.js";
import {BadRequestError, NotFoundError} from "../utils/customErrors.js";
import authenticateToken from "../middleware/authenticateToken.js";
import verifyUserExistence from "../middleware/verifyUserExistence.js";
import {Consideration} from "./considerationModel.js";
import {
    groupAndSortConsiderationsByStance,
    toggleCommentVote,
    toggleConsiderationVote,
    updateParentConsiderationsCount,
    validateAndCreateConsiderations,
    validateParentDocument
} from "./considerationService.js";
import translateEntityNumberToId from "../middleware/translateEntityNumberToId.js";

const considerationRoutes = express.Router();

// Get grouped & sorted Considerations for Solution or Solution Element
considerationRoutes.get('/considerations/:parentType/:parentNumber', (req, res, next) => translateEntityNumberToId(req.params.parentType, req.params.parentNumber)(req, res, next), asyncHandler(async (req, res) => {
    const unsortedConsiderations = await Consideration.find({
        parentType: req.params.parentType,
        parentId: req.entityId
    }).select('_id title stance description comments votes').lean();

    const considerations = groupAndSortConsiderationsByStance(unsortedConsiderations);

    return res.status(200).send({considerations});
}));

// Create new Consideration
considerationRoutes.post('/considerations', (req, res, next) => translateEntityNumberToId(req.body.parentType, req.body.parentNumber)(req, res, next), authenticateToken, verifyUserExistence, asyncHandler(async (req, res, next) => {
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


// Create a new comment for a Consideration
considerationRoutes.post('/considerations/:id/comment', authenticateToken, verifyUserExistence, asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw new BadRequestError('Invalid Consideration ID.');
    if (!req.body.text) throw new BadRequestError('Consideration Comment: Missing required field: text.');

    const consideration = await Consideration.findById(req.params.id);
    if (!consideration) throw new NotFoundError('Consideration not found.');

    const comment = {
        text: req.body.text,
        postedBy: req.user._id,
        createdAt: new Date()
    }

    consideration.comments.push(comment);
    await consideration.save();

    res.status(201).send({consideration, comment});
}));


// Vote on Consideration
considerationRoutes.post('/considerations/:id/vote', authenticateToken, verifyUserExistence, asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw new BadRequestError('Invalid Consideration ID.');

    const vote = req.body.vote;
    const consideration = await toggleConsiderationVote(req.params.id, req.user._id, vote);

    res.status(200).send({consideration, vote});
}));


// Vote on Consideration comment
considerationRoutes.post('/considerations/:considerationId/comment/:commentId/vote', authenticateToken, verifyUserExistence, asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.considerationId)) throw new BadRequestError('Invalid Consideration ID.');
    if (!mongoose.Types.ObjectId.isValid(req.params.commentId)) throw new BadRequestError('Invalid Consideration comment ID.');

    const vote = req.body.vote;
    if (vote !== 'upvote' && vote !== 'downvote') {
        throw new BadRequestError('Invalid vote type. Expected "upvote" for upvote or "downvote" for downvote.');
    }

    const comment = await toggleCommentVote(req.params.considerationId, req.params.commentId, req.user._id, vote);

    res.status(200).send({comment, vote});
}));

export default considerationRoutes;