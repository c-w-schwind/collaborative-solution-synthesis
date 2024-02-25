import express from "express";
import mongoose from "mongoose";
import {Solution} from "./solutionModel.js";
import authenticateToken from "../middleware/authenticateToken.js";
import {createSolutionElements} from "../solutionElement/solutionElementService.js";
import {createConsiderations} from "../consideration/considerationService.js";
import {validateSolution} from "./solutionService.js";
import {SolutionElement} from "../solutionElement/solutionElementModel.js";
import {Consideration} from "../consideration/considerationModel.js";
import verifyUserExistence from "../middleware/verifyUserExistence.js";

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


// Get all Solutions
solutionRoutes.get('/solutions', async (req, res) => {
    try {
        const solutions = Solution.find().populate('proposedBy', 'username');
        res.status(200).send({solutions});
    } catch (err) {
        console.log(err);
        if (err.name === 'ValidationError') {
            return res.status(400).send({ message: err.message });
        }
        res.status(500).send({ message: 'Internal server error' });
    }
});


// Get single Solution w/ Solution Elements & Considerations
solutionRoutes.get('/solutions/:id', async (req, res) => {
    try {
        const solutionId = req.params.id;
        const solution = await Solution.findById(solutionId).populate('proposedBy', 'username').lean();
        if (!solution) {
            return res.status(404).send({ message: 'Solution not found' });
        }

        solution.considerations = await Consideration.find({
            parentType: 'Solution',
            parentId: solutionId
        }).populate('proposedBy', 'username').lean();

        const solutionElements = await SolutionElement.find({solutionId: solutionId}).populate('proposedBy', 'username').lean();

        for (let element of solutionElements) {
            element.considerations = await Consideration.find({
                parentType: 'SolutionElement',
                parentId: element._id
            }).populate('proposedBy', 'username').lean();
        }

        return res.status(200).send({
            solution: solution,
            solutionElements: solutionElements,
        })
    } catch (err) {
        console.log(err);
        if (err.name === 'ValidationError') {
            return res.status(400).send({ message: err.message });
        }
        res.status(500).send({ message: 'Internal server error' });
    }
});

export default solutionRoutes;