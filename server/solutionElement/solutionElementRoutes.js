import express from "express";
import mongoose from "mongoose";
import {asyncHandler} from "../utils/asyncHandler.js";
import authenticateToken from "../middleware/authenticateToken.js";
import verifyUserExistence from "../middleware/verifyUserExistence.js";
import {
    createSolutionElements,
    updateParentSolutionElementsCount,
    validateSolutionElement
} from "./solutionElementService.js";


const solutionElementRoutes = express.Router();

// Create new solution element
solutionElementRoutes.post('/solutionElements', authenticateToken, verifyUserExistence, asyncHandler(async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        await validateSolutionElement(req.body);
        const solutionElement = await createSolutionElements(req.body, req.user._id, session);

        await updateParentSolutionElementsCount(req.body.parentSolution, 1, session)

        await session.commitTransaction();
        res.status(201).send(solutionElement);
    } catch (err) {
        await session.abortTransaction();
        next(err);
    } finally {
        await session.endSession();
    }
}));

export default solutionElementRoutes;