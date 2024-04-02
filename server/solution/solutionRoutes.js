import express from "express";
import mongoose from "mongoose";
import {asyncHandler} from "../utils/asyncHandler.js";
import {BadRequestError, NotFoundError} from "../utils/customErrors.js";
import authenticateToken from "../middleware/authenticateToken.js";
import verifyUserExistence from "../middleware/verifyUserExistence.js";
import {Solution} from "./solutionModel.js";
import {SolutionElement} from "../solutionElement/solutionElementModel.js";
import {Consideration} from "../consideration/considerationModel.js";
import {validateAndCreateSolution} from "./solutionService.js";
import {validateAndCreateSolutionElements} from "../solutionElement/solutionElementService.js";
import {validateAndCreateConsiderations} from "../consideration/considerationService.js";

const solutionRoutes = express.Router();


// Create new Solution
solutionRoutes.post('/solutions', authenticateToken, verifyUserExistence, asyncHandler(async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const userId = req.user._id;

        const solution = await validateAndCreateSolution(req.body, userId, session);

        const solutionElements = await validateAndCreateSolutionElements(req.body.solutionElementsDataArray, solution._id, userId, session);
        const solutionConsiderations = await validateAndCreateConsiderations(req.body.solutionConsiderationsDataArray, 'Solution', solution._id, userId, session);

        solution.activeSolutionElementsCount = solutionElements.length;
        solution.activeConsiderationsCount = solutionConsiderations.length;

        await solution.save({session});
        await session.commitTransaction();

        return res.status(201).send({
            solution,
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


// Get single Solution w/ Solution Elements & Considerations by SolutionNumber
solutionRoutes.get('/solutions/:solutionNumber', asyncHandler(async (req, res) => {
    const solutionNumber = parseInt(req.params.solutionNumber, 10);
    if (isNaN(solutionNumber)) throw new BadRequestError('Invalid Solution Number');

    const solution = await Solution.findOne({solutionNumber: solutionNumber}).populate('proposedBy', 'username').lean();
    if (!solution) throw new NotFoundError('Solution not found');

    solution.solutionElements = await SolutionElement.find({
        parentSolutionId: solution._id
    }).select('_id elementNumber title elementType overview').lean();

    solution.considerations = await Consideration.find({
        parentType: 'Solution',
        parentId: solution._id
    }).select('_id title stance description comments').lean();

    return res.status(200).send({solution})
}));

export default solutionRoutes;