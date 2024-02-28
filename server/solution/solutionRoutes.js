import express from "express";
import mongoose from "mongoose";
import {asyncHandler} from "../utils/asyncHandler.js";
import {BadRequestError, NotFoundError} from "../utils/customErrors.js";
import authenticateToken from "../middleware/authenticateToken.js";
import verifyUserExistence from "../middleware/verifyUserExistence.js";
import {Solution} from "./solutionModel.js";
import {SolutionElement} from "../solutionElement/solutionElementModel.js";
import {Consideration} from "../consideration/considerationModel.js";
import {validateSolution} from "./solutionService.js";
import {createSolutionElements} from "../solutionElement/solutionElementService.js";
import {createConsiderations} from "../consideration/considerationService.js";

const solutionRoutes = express.Router();


// Create new Solution
solutionRoutes.post('/solutions', authenticateToken, verifyUserExistence, asyncHandler(async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { title, overview, description, solutionElementsData, solutionConsiderationsData } = req.body;
        const author = req.user._id;
        await validateSolution({ title, overview, description }, solutionElementsData, solutionConsiderationsData);

        const solutionElements = solutionElementsData && solutionElementsData.length > 0 ? await createSolutionElements(solutionElementsData, author, session) : [];
        const solutionConsiderations = solutionConsiderationsData && solutionConsiderationsData.length > 0 ? await createConsiderations(solutionConsiderationsData, author, session) : [];

        const newSolution = new Solution({
            title,
            overview,
            description,
            proposedBy: author,
            activeConsiderationsCount: solutionConsiderations.length,
            activeSolutionElementsCount: solutionElements.length
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
        next(err);
    } finally {
        await session.endSession();
    }
}));


// Get all Solutions
solutionRoutes.get('/solutions', asyncHandler(async (req, res) => {
    const solutions = await Solution.find().populate('proposedBy', 'username');
    res.status(200).send({solutions});
}));


// Get single Solution w/ Solution Elements & Considerations
solutionRoutes.get('/solutions/:id', asyncHandler(async (req, res) => {
    const parentSolution = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(parentSolution)) throw new BadRequestError('Invalid Consideration ID.');

    const solution = await Solution.findById(parentSolution).populate('proposedBy', 'username').lean();
    if (!solution) throw new NotFoundError('Solution not found');

    solution.considerations = await Consideration.find({
        parentType: 'Solution',
        parentId: parentSolution
    }).populate('proposedBy', 'username').lean();

    const solutionElements = await SolutionElement.find({parentSolution: parentSolution}).populate('proposedBy', 'username').lean();

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
}));

export default solutionRoutes;