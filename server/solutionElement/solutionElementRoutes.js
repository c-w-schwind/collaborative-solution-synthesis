import express from "express";
import mongoose from "mongoose";
import {asyncHandler} from "../utils/asyncHandler.js";
import {BadRequestError, NotFoundError} from "../utils/customErrors.js";
import authenticateToken from "../middleware/authenticateToken.js";
import verifyUserExistence from "../middleware/verifyUserExistence.js";
import {Solution} from "../solution/solutionModel.js";
import {SolutionElement} from "./solutionElementModel.js";
import {Consideration} from "../consideration/considerationModel.js";
import {updateParentSolutionElementsCount, validateAndCreateSolutionElements,} from "./solutionElementService.js";


const solutionElementRoutes = express.Router();

// Create new solution element
solutionElementRoutes.post('/solutionElements', authenticateToken, verifyUserExistence, asyncHandler(async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        if (!await Solution.findById(req.body.parentSolutionId)) throw new NotFoundError('Solution not found');

        const solutionElement = await validateAndCreateSolutionElements(req.body, req.body.parentSolutionId, req.user._id, session);
        await updateParentSolutionElementsCount(req.body.parentSolutionId, 1, session)

        await session.commitTransaction();
        res.status(201).send(solutionElement[0]);
    } catch (err) {
        await session.abortTransaction();
        next(err);
    } finally {
        await session.endSession();
    }
}));

// Get solution element
solutionElementRoutes.get('/solutionElements/:id', asyncHandler(async (req, res) => {
    const elementId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(elementId)) throw new BadRequestError('Invalid Solution Element ID');

    const solutionElement = await SolutionElement.findById(elementId).populate('proposedBy', 'username').lean();
    if (!solutionElement) throw new NotFoundError('Solution Element not found');

    solutionElement.considerations = await Consideration.find({
        parentType: 'SolutionElement',
        parentId: solutionElement._id
    }).populate('proposedBy', 'username').lean();

    return res.status(200).send({solutionElement});
}));

export default solutionElementRoutes;