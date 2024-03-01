import express from "express";
import mongoose from "mongoose";
import {asyncHandler} from "../utils/asyncHandler.js";
import {BadRequestError, NotFoundError} from "../utils/customErrors.js";
import authenticateToken from "../middleware/authenticateToken.js";
import verifyUserExistence from "../middleware/verifyUserExistence.js";
import {Consideration} from "./considerationModel.js";
import {
    toggleCommentVote,
    toggleConsiderationVote,
    updateParentConsiderationsCount,
    validateAndCreateConsiderations,
    validateParentDocument
} from "./considerationService.js";

const considerationRoutes = express.Router();


// Create new Consideration
considerationRoutes.post('/considerations', authenticateToken, verifyUserExistence, asyncHandler(async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        await validateParentDocument(req.body.parentType, req.body.parentId);

        const consideration = await validateAndCreateConsiderations(req.body, req.body.parentType, req.body.parentId, req.user._id, session);
        await updateParentConsiderationsCount(req.body.parentType, req.body.parentId, 1, session);

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
    const consideration = await toggleCommentVote(req.params.considerationId, req.params.commentId, req.user._id, vote);

    res.status(200).send({consideration, vote});
}));

export default considerationRoutes;