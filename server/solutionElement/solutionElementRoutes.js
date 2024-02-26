import express from "express";
import mongoose from "mongoose";
import authenticateToken from "../middleware/authenticateToken.js";
import verifyUserExistence from "../middleware/verifyUserExistence.js";
import {
    createSolutionElements,
    updateParentSolutionElementsCount,
    validateSolutionElement
} from "./solutionElementService.js";


const solutionElementRoutes = express.Router();

// Create new solution element
solutionElementRoutes.post('/solutionElements', authenticateToken, verifyUserExistence, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        await validateSolutionElement(req.body);
        const solutionElement = await createSolutionElements(req.body, req.user._id, session);

        await updateParentSolutionElementsCount(req.body.solutionId, 1, session)

        await session.commitTransaction();
        return res.status(201).send(solutionElement);
    } catch (err) {
        await session.abortTransaction();
        console.log(err);
        if (err.name === 'ValidationError') {
            return res.status(400).send({ message: err.message });
        }
        res.status(500).send({ message: 'Internal server error' });
    } finally {
        await session.endSession();
    }
});

export default solutionElementRoutes;