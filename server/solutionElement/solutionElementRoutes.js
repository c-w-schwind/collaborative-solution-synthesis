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

// Create new Solution Element
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

// Get single Solution Element w/ Considerations by elementNumber
solutionElementRoutes.get('/solutionElements/:elementNumber', asyncHandler(async (req, res) => {
    const elementNumber = parseInt(req.params.elementNumber, 10);
    if (isNaN(elementNumber)) throw new BadRequestError('Invalid Solution Element Number.');

    const solutionElement = await SolutionElement.findOne({elementNumber: elementNumber}).populate('proposedBy', 'username').lean();
    if (!solutionElement) throw new NotFoundError('Solution Element not found.');

    solutionElement.considerations = await Consideration.find({
        parentType: 'SolutionElement',
        parentId: solutionElement._id
    }).select('_id title stance description comments').lean();

    return res.status(200).send({solutionElement});
}));

export default solutionElementRoutes;