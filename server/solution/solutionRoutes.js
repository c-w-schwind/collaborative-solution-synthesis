import express from "express";
import mongoose from "mongoose";
import {asyncHandler} from "../utils/asyncHandler.js";
import {NotFoundError} from "../utils/customErrors.js";
import authenticateToken from "../middleware/authenticateToken.js";
import verifyUserExistence from "../middleware/verifyUserExistence.js";
import {Solution} from "./solutionModel.js";
import {SolutionElement} from "../solutionElement/solutionElementModel.js";
import {Consideration} from "../consideration/considerationModel.js";
import {validateAndCreateSolution} from "./solutionService.js";
import {validateAndCreateSolutionElements} from "../solutionElement/solutionElementService.js";
import {groupAndSortConsiderationsByStance, validateAndCreateConsiderations} from "../consideration/considerationService.js";
import translateEntityNumberToId from "../middleware/translateEntityNumberToId.js";

const solutionRoutes = express.Router();


// Create new Solution
solutionRoutes.post("/solutions", authenticateToken(), verifyUserExistence, asyncHandler(async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const userId = req.user._id;

        const solution = await validateAndCreateSolution(req.body, userId, session);

        const solutionElements = await validateAndCreateSolutionElements(req.body.solutionElementsDataArray, solution._id, userId, session);
        const solutionConsiderations = await validateAndCreateConsiderations(req.body.solutionConsiderationsDataArray, "Solution", solution._id, userId, session);

        solution.activeSolutionElementsCount = solutionElements.length;
        solution.activeConsiderationsCount = solutionConsiderations.length;

        await solution.save({session});
        await session.commitTransaction();

        return res.status(201).send(solution);
    } catch (err) {
        await session.abortTransaction();
        next(err);
    } finally {
        await session.endSession();
    }
}));


// Get all Solutions
solutionRoutes.get("/solutions", authenticateToken({required: false}), asyncHandler(async (req, res) => {
    let query;
    if (req.user) {
        query = {$or: [{status: "public"}, {status: "private", proposedBy: req.user._id}]};
    } else {
        query = {status: "public"};
    }

    const solutions = await Solution.find(query).populate("proposedBy", "username");
    res.status(200).send({solutions});
}));



// Get single Solution w/ Solution Elements & Considerations by SolutionNumber
solutionRoutes.get("/solutions/:solutionNumber", (req, res, next) => translateEntityNumberToId("Solution", req.params.solutionNumber)(req, res, next), asyncHandler(async (req, res) => {
    const solution = await Solution.findById(req.entityId).populate("proposedBy", "username").lean();
    if (!solution) throw new NotFoundError("Solution not found");

    solution.solutionElements = await SolutionElement.find({
        parentSolutionId: solution._id
    }).select("_id elementNumber title elementType overview").lean();

    const considerations = await Consideration.find({
        parentType: "Solution",
        parentId: solution._id
    }).select("_id title stance description comments votes proposedBy").lean();

    solution.considerations = groupAndSortConsiderationsByStance(considerations);

    return res.status(200).send({solution});
}));


// Get all Solution drafts of User
solutionRoutes.get("/solutions/drafts", authenticateToken(), asyncHandler(async (req, res) => {
    const solutionDrafts = await Solution.find({status: "private", proposedBy: req.user._id}).populate("proposedBy", "username");
    res.status(200).send({solutionDrafts});
}));


export default solutionRoutes;