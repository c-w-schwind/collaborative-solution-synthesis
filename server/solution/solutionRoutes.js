import express from "express";
import mongoose from "mongoose";
import {asyncHandler} from "../utils/asyncHandler.js";
import {NotFoundError, UnauthorizedError} from "../utils/customErrors.js";
import authenticateToken from "../middleware/authenticateToken.js";
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
    // Fetch solutions based on user access
    const publicStatuses = ["public", "proposal"];
    let query;

    if (req.user) {
        query = {
            $or: [
                {status: {$in: publicStatuses}},
                {authorizedUsers: req.user._id}
            ]
        };
    } else {
        query = {status: {$in: publicStatuses}};
    }

    const solutions = await Solution.find(query)
        .populate("proposedBy", "username")
        .sort({status: 1, solutionNumber: 1}) // Sort by status and solutionNumber
        .lean();

    // Separating main solutions, change proposals, and drafts
    const drafts = solutions.filter(sol => sol.status === "draft");
    const mainSolutions = solutions.filter(sol => sol.status !== "draft" && !(sol.changeProposalFor && ["under_review", "proposal"].includes(sol.status)));
    const changeProposals = solutions.filter(sol => sol.changeProposalFor && ["under_review", "proposal"].includes(sol.status));

    // Adding change proposals to associated solutions
    mainSolutions.forEach(sol => {
        sol.changeProposals = changeProposals.filter(cp => cp.changeProposalFor.toString() === sol._id.toString())
    });

    const sortedSolutionList = [...drafts, ...mainSolutions];
    res.status(200).send(sortedSolutionList);
}));


// Get all Solution drafts of a User
solutionRoutes.get("/solutions/drafts", authenticateToken(), asyncHandler(async (req, res) => {
    const solutionDrafts = await Solution.find({status: {$in: ["draft", "under_review"]}, proposedBy: req.user._id}).populate("proposedBy", "username");
    res.status(200).send(solutionDrafts);
}));


// Get single Solution w/ Solution Elements & Considerations by SolutionNumber
solutionRoutes.get("/solutions/:solutionNumber", authenticateToken({required: false}), (req, res, next) => translateEntityNumberToId("Solution", req.params.solutionNumber)(req, res, next), authorizeAccess("Solution"), asyncHandler(async (req, res) => {
    const solution = req.entity;
    const publicStatuses = ["proposal", "accepted"];

    // For change proposals, also fetch original solutionNumber
    if (solution.changeProposalFor && ["draft", "under_review", "proposal"].includes(solution.status)) {
        const originalSolution = await Solution.findById(solution.changeProposalFor).select("solutionNumber").lean();

        if (originalSolution) {
            solution.originalSolutionNumber = originalSolution.solutionNumber;
        }
    }

    // Fetch Solution Elements based on user access
    let elementQuery;

    if (req.user) {
        elementQuery = {
            parentSolutionId: solution._id,
            $or: [
                {status: {$in: publicStatuses}},
                {status: {$in: ["draft", "under_review"]}, authorizedUsers: req.user._id}
            ]
        };
    } else {
        elementQuery = {
            parentSolutionId: solution._id,
            status: {$in: publicStatuses}
        };
    }

    const retrievedElements = await SolutionElement.find(elementQuery).select("_id elementNumber title elementType overview status changeProposalFor changeSummary").lean();

    // Separating main elements, change proposals, and drafts
    const mainElements = retrievedElements.filter(el => el.status !== "draft" && !(el.changeProposalFor && ["under_review", "proposal"].includes(el.status)));
    const changeProposals = retrievedElements.filter(el => el.changeProposalFor && ["under_review", "proposal"].includes(el.status));

    // Adding change proposals to associated elements
    solution.solutionElements = mainElements.map(element => ({
        ...element,
        changeProposals: changeProposals.filter(cp => cp.changeProposalFor.toString() === element._id.toString())
    }));
    solution.elementDrafts = retrievedElements.filter(el => el.status === "draft");

    // Fetch Considerations
    const considerations = await Consideration.find({
        parentType: "Solution",
        parentId: solution._id
    }).select("_id title stance description comments votes proposedBy").lean();

    solution.considerations = groupAndSortConsiderationsByStance(considerations);

    return res.status(200).send(solution);
}));


// Create new Solution
solutionRoutes.post("/solutions", authenticateToken(), asyncHandler(async (req, res, next) => {
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
solutionRoutes.put("/solutions/:solutionNumber", authenticateToken(), (req, res, next) => translateEntityNumberToId("Solution", req.params.solutionNumber)(req, res, next), authorizeAccess("Solution"), asyncHandler(async (req, res, next) => {
    const solution = req.entity;

    if (!["draft", "under_review"].includes(solution.status)) {
        throw new UnauthorizedError("Cannot modify a public Solution outside of proposals");
    }

    if (req.user._id.toString() !== solution.proposedBy._id.toString()) {
        throw new UnauthorizedError("Access Denied");
    }

    const updatedSolution = await Solution.findByIdAndUpdate(req.entityId, {$set: req.body}, {new: true}).populate("proposedBy", "username").lean();

    res.status(200).send(updatedSolution);
}));


// Delete a single Solution draft
solutionRoutes.delete("/solutions/:solutionNumber", authenticateToken(), (req, res, next) => translateEntityNumberToId("Solution", req.params.solutionNumber)(req, res, next), authorizeAccess("Solution", {requireAuthor: true}), asyncHandler(async (req, res, next) => {

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        // Re-fetch Solution within transaction session
        const solution = await Solution.findById(req.entityId).session(session).lean();
        if (!solution) throw new NotFoundError("Solution not found");

        if (!["draft", "under_review"].includes(solution.status)) {
            throw new UnauthorizedError("Cannot delete a public Solution");
        }

        const solutionElementIds = await SolutionElement.distinct("_id", {parentSolutionId: solution._id}).session(session);

        await Consideration.deleteMany({parentType: "Solution", parentId: solution._id}).session(session);
        if (solutionElementIds.length > 0) {
            await Consideration.deleteMany({parentType: "SolutionElement", parentId: {$in: solutionElementIds}}).session(session);
            await SolutionElement.deleteMany({_id: {$in: solutionElementIds}}).session(session);
        }
        await Solution.deleteOne({_id: solution._id}).session(session);

        await session.commitTransaction();
        res.status(204).send();
    } catch (err) {
        await session.abortTransaction();
        next(err);
    } finally {
        await session.endSession();
    }
}));


export default solutionRoutes;