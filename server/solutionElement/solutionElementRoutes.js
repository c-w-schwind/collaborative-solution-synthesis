import express from "express";
import mongoose from "mongoose";
import {asyncHandler} from "../utils/asyncHandler.js";
import {NotFoundError, UnauthorizedError} from "../utils/customErrors.js";
import authenticateToken from "../middleware/authenticateToken.js";
import {Solution} from "../solution/solutionModel.js";
import {SolutionElement} from "./solutionElementModel.js";
import {Consideration} from "../consideration/considerationModel.js";
import {updateParentSolutionElementsCount, validateAndCreateSolutionElements} from "./solutionElementService.js";
import translateEntityNumberToId from "../middleware/translateEntityNumberToId.js";
import {groupAndSortConsiderationsByStance} from "../consideration/considerationService.js";
import authorizeAccess from "../middleware/authorizeAccess.js";


const solutionElementRoutes = express.Router();

// Create new Solution Element
solutionElementRoutes.post("/solutionElements", authenticateToken(), (req, res, next) => translateEntityNumberToId("Solution", req.body.parentNumber, "parentSolutionId")(req, res, next), authorizeAccess("Solution", {entityIdField: "parentSolutionId"}), asyncHandler(async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const solutionElement = await validateAndCreateSolutionElements(req.body, req.parentSolutionId, req.user._id, session);
        await updateParentSolutionElementsCount(req.parentSolutionId, 1, session);

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
solutionElementRoutes.get("/solutionElements/:elementNumber", authenticateToken({required: false}), (req, res, next) => translateEntityNumberToId("SolutionElement", req.params.elementNumber)(req, res, next), authorizeAccess("SolutionElement"), asyncHandler(async (req, res) => {
    const solutionElement = req.entity;

    const considerations = await Consideration.find({
        parentType: "SolutionElement",
        parentId: solutionElement._id
    }).select("_id title stance description comments votes proposedBy").lean();

    solutionElement.considerations = groupAndSortConsiderationsByStance(considerations);

    return res.status(200).send(solutionElement);
}));


// Update a single field or multiple fields of a Solution Element draft
solutionElementRoutes.put("/solutionElements/:elementNumber", authenticateToken(), (req, res, next) => translateEntityNumberToId("SolutionElement", req.params.elementNumber)(req, res, next), authorizeAccess("SolutionElement"), asyncHandler(async (req, res, next) => {
    const solutionElement = req.entity;

    if (!["draft", "under_review"].includes(solutionElement.status)) {
        throw new UnauthorizedError("Cannot modify a public Solution Element");
    }

    if (req.user._id.toString() !== solutionElement.proposedBy._id.toString()) {
        throw new UnauthorizedError("Access Denied: Modification only allowed for Solution Element author");
    }

    const updatedSolutionElement = await SolutionElement.findByIdAndUpdate(req.entityId, {$set: req.body}, {new: true}).populate("proposedBy", "username").lean();

    res.status(200).send(updatedSolutionElement);
}));


export default solutionElementRoutes;