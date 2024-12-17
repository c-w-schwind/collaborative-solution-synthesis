import express from "express";
import mongoose from "mongoose";
import {asyncHandler} from "../utils/asyncHandler.js";
import {BadRequestError, NotFoundError, UnauthorizedError} from "../utils/customErrors.js";
import authenticateToken from "../middleware/authenticateToken.js";
import {Solution} from "./solutionModel.js";
import {SolutionElement} from "../solutionElement/solutionElementModel.js";
import {Consideration} from "../consideration/considerationModel.js";
import {createSolution, createSolutionChangeProposal} from "./solutionService.js";
import {groupAndSortConsiderationsByStance} from "../consideration/considerationService.js";
import translateEntityNumberToId from "../middleware/translateEntityNumberToId.js";
import authorizeAccess from "../middleware/authorizeAccess.js";

const solutionRoutes = express.Router();


// Get all Solutions
solutionRoutes.get("/solutions", authenticateToken({required: false}), asyncHandler(async (req, res) => {
    const publicStatuses = ["public", "proposal"];
    let query;

    // Fetch solutions based on user access
    if (req.user) {
        query = {
            status: {$ne: "deprecated"},
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
        sol.changeProposals = changeProposals.filter(cp => cp.changeProposalFor.toString() === sol._id.toString());
    });

    const sortedSolutionList = [...drafts, ...mainSolutions];
    res.status(200).send(sortedSolutionList);
}));


// Get single Solution w/ Solution Elements & Considerations by SolutionNumber
solutionRoutes.get("/solutions/:solutionNumber/:versionNumber?", authenticateToken({required: false}), (req, res, next) => translateEntityNumberToId("Solution", req.params.solutionNumber, req.params.versionNumber)(req, res, next), authorizeAccess("Solution"), asyncHandler(async (req, res) => {
    const solution = req.entity;
    const publicStatuses = ["proposal", "accepted"];

    // Fetch original solutionNumber for change proposals
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
            parentSolutionNumber: solution.solutionNumber,
            $or: [
                {status: {$in: publicStatuses}},
                {status: {$in: ["draft", "under_review"]}, authorizedUsers: req.user._id}
            ]
        };
    } else {
        elementQuery = {
            parentSolutionNumber: solution.solutionNumber,
            status: {$in: publicStatuses}
        };
    }

    const retrievedElements = await SolutionElement.find(elementQuery).select("_id elementNumber versionNumber title elementType overview status changeProposalFor changeSummary").lean();

    // Separate main elements, change proposals, and drafts
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
        const solution = await createSolution(req.body, req.user._id, session);

        await session.commitTransaction();

        return res.status(201).send(solution);
    } catch (err) {
        await session.abortTransaction();
        next(err);
    } finally {
        await session.endSession();
    }
}));


// Create Change Proposal for a Solution
solutionRoutes.post("/solutions/:solutionNumber/changeProposal", authenticateToken(), (req, res, next) => translateEntityNumberToId("Solution", req.params.solutionNumber)(req, res, next), authorizeAccess("Solution"), asyncHandler(async (req, res, next) => {
    // No versionNumbers needed, since CPs can only be made to established Solutions
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        // Re-fetch Solution within transaction session
        const originalSolution = await Solution.findById(req.entity._id).session(session).lean();
        if (!originalSolution) throw new NotFoundError("Original Solution not found");
        if (originalSolution.status !== "public") throw new BadRequestError("Change proposals can only be created for established solutions.");

        const changeProposal = await createSolutionChangeProposal(originalSolution, req.user._id, session);

        await session.commitTransaction();
        res.status(201).send({solutionNumber: changeProposal.solutionNumber, versionNumber: changeProposal.versionNumber});
    } catch (err) {
        await session.abortTransaction();
        next(err);
    } finally {
        await session.endSession();
    }
}));


// Update a single field or multiple fields of an unpublished Solution
solutionRoutes.put("/solutions/:solutionNumber/:versionNumber?", authenticateToken(), (req, res, next) => translateEntityNumberToId("Solution", req.params.solutionNumber, req.params.versionNumber)(req, res, next), authorizeAccess("Solution", {requireAuthor: true}), asyncHandler(async (req, res, next) => {
    const solution = req.entity;

    if (!["draft", "under_review"].includes(solution.status)) {
        throw new UnauthorizedError("Cannot modify an established or non-draft Solution.");
    }

    const updatedSolution = await Solution.findByIdAndUpdate(req.entity._id, {$set: req.body}, {new: true}).populate("proposedBy", "username").lean();

    res.status(200).send(updatedSolution);
}));


// Delete a single unpublished Solution w/ its Elements
solutionRoutes.delete("/solutions/:solutionNumber/:versionNumber", authenticateToken(), (req, res, next) => translateEntityNumberToId("Solution", req.params.solutionNumber, req.params.versionNumber)(req, res, next), authorizeAccess("Solution", {requireAuthor: true}), asyncHandler(async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        // Re-fetch Solution within transaction session
        const solution = await Solution.findById(req.entity._id).session(session).lean();
        if (!solution) throw new NotFoundError("Solution not found");

        if (!["draft", "under_review"].includes(solution.status)) {
            throw new UnauthorizedError("Cannot delete an established or non-draft Solution.");
        }

        // If the Solution is a Change Proposal, it will only mirror the elements of the original and a user cannot propose new elements for the CP. in that case we don't want to delete any elements. That even would be dangerous, since an element will only have a parentSolutionNumber, so it will be wandering with changes in its parent solutions (which are resulting in a new solution that replaces the old one). So then we might be deleting the drafts of some other user, right? If the solution is a newly proposed solution, then all the elements are new and only belong to this new solution anyway, so can be safely deleted. Maybe we should still, for absolute safety reasons, do an author check here? or do you think it's not necessary? Also: i think this warrants a comment here, maybe you can make it a concise little explanation why we have this check.
        if (!solution.changeProposalFor) {
            const solutionElementIds = await SolutionElement.distinct("_id", {parentSolutionNumber: solution.solutionNumber}).session(session);
            if (solutionElementIds.length > 0) {
                await Consideration.deleteMany({parentType: "SolutionElement", parentId: {$in: solutionElementIds}}).session(session);
                await SolutionElement.deleteMany({_id: {$in: solutionElementIds}}).session(session);
            }
        }
        await Consideration.deleteMany({parentType: "Solution", parentId: solution._id}).session(session);
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