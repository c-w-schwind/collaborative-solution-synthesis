import express from "express";
import mongoose from "mongoose";
import {asyncHandler} from "../utils/asyncHandler.js";
import {BadRequestError, NotFoundError} from "../utils/customErrors.js";
import authenticateToken from "../middleware/authenticateToken.js";
import {SolutionElement} from "./solutionElementModel.js";
import {Consideration} from "../consideration/considerationModel.js";
import {updateParentSolutionElementsCount, createSolutionElementChangeProposal, createSolutionElement} from "./solutionElementService.js";
import translateEntityNumberToId from "../middleware/translateEntityNumberToId.js";
import {groupAndSortConsiderationsByStance} from "../consideration/considerationService.js";
import authorizeAccess from "../middleware/authorizeAccess.js";

const solutionElementRoutes = express.Router();


// Get single Solution Element w/ Considerations by elementNumber and versionNumber
solutionElementRoutes.get("/solutionElements/:elementNumber/:versionNumber?", authenticateToken({required: false}), (req, res, next) => translateEntityNumberToId("SolutionElement", req.params.elementNumber, req.params.versionNumber)(req, res, next), authorizeAccess("SolutionElement"), asyncHandler(async (req, res) => {
    const solutionElement = req.entity;

    // For change proposals, also fetch original elementNumber
    if (solutionElement.changeProposalFor && ["draft", "under_review", "proposal"].includes(solutionElement.status)) {
        const originalSolutionElement = await SolutionElement.findById(solutionElement.changeProposalFor).select("elementNumber").lean();

        if (originalSolutionElement) {
            solutionElement.originalElementNumber = originalSolutionElement.elementNumber;
        }
    }

    const considerations = await Consideration.find({
        parentType: "SolutionElement",
        parentId: solutionElement._id
    }).select("_id title stance description comments votes proposedBy").lean();

    solutionElement.considerations = groupAndSortConsiderationsByStance(considerations);

    return res.status(200).send(solutionElement);
}));


// Create new Solution Element draft
solutionElementRoutes.post("/solutionElements", authenticateToken(), asyncHandler(async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const solutionElement = await createSolutionElement(req.body, req.user._id, session);

        await session.commitTransaction();
        res.status(201).send(solutionElement);
    } catch (err) {
        await session.abortTransaction();
        next(err);
    } finally {
        await session.endSession();
    }
}));


// Create Change Proposal for an existing Solution Element
solutionElementRoutes.post("/solutionElements/:elementNumber/changeProposal", authenticateToken(), (req, res, next) => translateEntityNumberToId("SolutionElement", req.params.elementNumber, req.params.versionNumber)(req, res, next), authorizeAccess("SolutionElement"), asyncHandler(async (req, res, next) => {
    // No versionNumbers needed, since CPs can only be made to established Elements within established Solutions
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        // Re-fetch Solution Element within transaction session
        const originalElement = await SolutionElement.findById(req.entity._id).session(session).lean();
        if (!originalElement) throw new NotFoundError("Original Solution Element not found");
        if (originalElement.status !== "accepted") throw new BadRequestError("Change proposals can only be created for established elements.");

        const changeProposal = await createSolutionElementChangeProposal(originalElement, req.user._id, session);

        await session.commitTransaction();
        res.status(201).send({elementNumber: changeProposal.elementNumber, versionNumber: changeProposal.versionNumber});
    } catch (err) {
        await session.abortTransaction();
        next(err);
    } finally {
        await session.endSession();
    }
}));


// Update a single field or multiple fields of a Solution Element draft
solutionElementRoutes.put("/solutionElements/:elementNumber/:versionNumber?", authenticateToken(), (req, res, next) => translateEntityNumberToId("SolutionElement", req.params.elementNumber, req.params.versionNumber)(req, res, next), authorizeAccess("SolutionElement", {requireAuthor: true}), asyncHandler(async (req, res, next) => {
    const solutionElement = req.entity;

    if (!["draft", "under_review"].includes(solutionElement.status)) {
        throw new BadRequestError("Cannot modify an established or non-draft Solution Element");
    }

    const updatedSolutionElement = await SolutionElement.findByIdAndUpdate(req.entity._id, {$set: req.body}, {new: true}).populate("proposedBy", "username").lean();

    res.status(200).send(updatedSolutionElement);
}));


// Delete a single, unpublished Solution Element
solutionElementRoutes.delete("/solutionElements/:elementNumber/:versionNumber", authenticateToken(), (req, res, next) => translateEntityNumberToId("SolutionElement", req.params.elementNumber, req.params.versionNumber)(req, res, next), authorizeAccess("SolutionElement", {requireAuthor: true}), asyncHandler(async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        // Re-fetch Solution Element within transaction session
        const solutionElement = await SolutionElement.findById(req.entity._id).session(session).lean();
        if (!solutionElement) throw new NotFoundError("Solution Element not found");

        if (!["draft", "under_review"].includes(solutionElement.status)) {
            throw new BadRequestError("Cannot delete an established or non-draft Solution Element");
        }

        await Consideration.deleteMany({parentType: "SolutionElement", parentId: solutionElement._id}).session(session);
        await SolutionElement.deleteOne({_id: solutionElement._id}).session(session);

        await session.commitTransaction();
        res.status(204).send();
    } catch (err) {
        await session.abortTransaction();
        next(err);
    } finally {
        await session.endSession();
    }
}));


export default solutionElementRoutes;