import express from "express";
import mongoose from "mongoose";
import {asyncHandler} from "../utils/asyncHandler.js";
import {NotFoundError, UnauthorizedError} from "../utils/customErrors.js";
import authenticateToken from "../middleware/authenticateToken.js";
import verifyUserExistence from "../middleware/verifyUserExistence.js";
import {Solution} from "./solutionModel.js";
import {SolutionElement} from "../solutionElement/solutionElementModel.js";
import {Consideration} from "../consideration/considerationModel.js";
import {validateAndCreateSolution} from "./solutionService.js";
import {groupAndSortConsiderationsByStance} from "../consideration/considerationService.js";
import translateEntityNumberToId from "../middleware/translateEntityNumberToId.js";
import authorizeAccess from "../middleware/authorizeAccess.js";

const solutionRoutes = express.Router();


// Get all Solutions
solutionRoutes.get("/solutions", authenticateToken({required: false}), asyncHandler(async (req, res) => {
    let query = {status: "public"};
    if (req.user) {
        query = {$or: [{status: "public"}, {authorizedUsers: req.user._id}]};
    }

    const solutions = await Solution.find(query)
        .populate("proposedBy", "username")
        .sort({status: 1}); // Sorting draft status first to display drafts at the top of the solutions list page
    res.status(200).send(solutions);
}));


// Get all Solution drafts of a User
solutionRoutes.get("/solutions/drafts", authenticateToken(), asyncHandler(async (req, res) => {
    const solutionDrafts = await Solution.find({status: {$in: ["draft", "under_review"]}, proposedBy: req.user._id}).populate("proposedBy", "username");
    res.status(200).send(solutionDrafts);
}));


// Get single Solution w/ Solution Elements & Considerations by SolutionNumber
solutionRoutes.get("/solutions/:solutionNumber", authenticateToken({required: false}), (req, res, next) => translateEntityNumberToId("Solution", req.params.solutionNumber)(req, res, next), authorizeAccess("Solution"), asyncHandler(async (req, res) => {
    const solution = await Solution.findById(req.entityId).populate("proposedBy", "username").lean();
    if (!solution) throw new NotFoundError("Solution not found");

    const elementQuery = {parentSolutionId: solution._id};
    const publicStatuses = ["proposal", "accepted", "declined"];

    if (req.user) {
        elementQuery.$or = [
            {status: {$in: publicStatuses}},
            {status: {$in: ["draft", "under_review"]}, authorizedUsers: req.user._id}
        ];
    } else {
        elementQuery.status = {$in: publicStatuses};
    }

    solution.solutionElements = await SolutionElement.find(elementQuery).select("_id elementNumber title elementType overview status").lean();

    const considerations = await Consideration.find({
        parentType: "Solution",
        parentId: solution._id
    }).select("_id title stance description comments votes proposedBy").lean();

    solution.considerations = groupAndSortConsiderationsByStance(considerations);

    return res.status(200).send(solution);
}));


// Create new Solution
solutionRoutes.post("/solutions", authenticateToken(), verifyUserExistence, asyncHandler(async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const solution = await validateAndCreateSolution(req.body, req.user._id, session);
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


// Update a single field or multiple fields of a Solution draft
solutionRoutes.put("/solutions/:solutionNumber", authenticateToken(), verifyUserExistence, (req, res, next) => translateEntityNumberToId("Solution", req.params.solutionNumber)(req, res, next), authorizeAccess("Solution"), asyncHandler(async (req, res, next) => {
    const solution = await Solution.findById(req.entityId).lean();
    if (!solution) throw new NotFoundError("Solution not found");

    if (!["draft", "under_review"].includes(solution.status)) {
        throw new UnauthorizedError("Cannot modify a public Solution outside of proposals");
    }

    if (!req.user._id.equals(solution.proposedBy._id)) {
        throw new UnauthorizedError("Access Denied");
    }

    const updatedSolution = await Solution.findByIdAndUpdate(req.entityId, {$set: req.body}, {new: true}).lean();

    res.status(200).send(updatedSolution);
}));


export default solutionRoutes;