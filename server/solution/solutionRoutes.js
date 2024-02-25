import express from "express";
import mongoose from "mongoose";
import {Solution} from "./solutionModel.js";
import authenticateToken from "../middleware/authenticateToken.js";
import {createSolutionElements} from "../solutionElement/solutionElementService.js";
import {createConsiderations} from "../consideration/considerationService.js";
import {validateSolution} from "./solutionService.js";

const solutionRoutes = express.Router();


// Create new Solution
solutionRoutes.post('/solutions', authenticateToken, verifyUserExistence, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { title, overview, description, solutionElementsData, solutionConsiderationsData } = req.body;
        const author = req.user._id;
        await validateSolution({ title, overview, description }, solutionElementsData, solutionConsiderationsData, author);

        const solutionElements = solutionElementsData && solutionElementsData.length > 0 ? await createSolutionElements(solutionElementsData, author, session) : [];
        const solutionConsiderations = solutionConsiderationsData && solutionConsiderationsData.length > 0 ? await createConsiderations(solutionConsiderationsData, author, session) : [];

        const newSolution = new Solution({
            title,
            overview,
            description,
            proposedBy: author,
            activeConsiderationsCount: solutionConsiderations.length
        });

        await newSolution.save({session});
        await session.commitTransaction();

        return res.status(201).send({
            solution: newSolution,
            solutionElements,
            solutionConsiderations
        });
    } catch (err){
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

export default solutionRoutes;