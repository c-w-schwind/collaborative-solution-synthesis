import express from "express";
import authenticateToken from "../middleware/authenticateToken.js";
import {User} from "../models/userModel.js";
import {Solution} from "../models/solutionModel.js";
import {SolutionElement} from "../models/solutionElementModel.js";
import {Consideration} from "../models/considerationModel.js";
import mongoose from "mongoose";

const solutionRoutes = express.Router();

// Create new Solution
solutionRoutes.post('/solutions', authenticateToken, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { title, overview, description, solutionElementsData, solutionConsiderationsData } = req.body; // TODO: overview?
        const author = req.user._id;

        if (!title) {
            return res.status(400).send({message: 'Missing required field: title.'});
        }
        //TODO: overview? other stuff?
        if (!description) {
            return res.status(400).send({message: 'Missing required field: description.'});
        }
        const existingUser = await User.findById(author);
        if (!existingUser) {
            return res.status(404).send({message: 'User not found.'});
        }

        const solutionElementsIds = [];
        if (solutionElementsData) {
            for (const elementData of solutionElementsData) {
                const element = new SolutionElement({
                    ...elementData,
                    proposedBy: author
                });
                await element.save({session});
                solutionElementsIds.push(element._id);
            }
        }

        const considerationsIds = [];
        if (solutionConsiderationsData) {
            for (const considerationData of solutionConsiderationsData) {
                const consideration = new Consideration({
                    ...considerationData,
                    proposedBy: author
                });
                await consideration.save({session});
                considerationsIds.push(consideration._id);
            }
        }

        const newSolution = new Solution({
            title,
            overview,
            description,
            proposedBy: author,
            solutionElements: solutionElementsIds,
            solutionConsiderations: considerationsIds
        });
        await newSolution.save({session});
        await session.commitTransaction();
        return res.status(201).send(newSolution);
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

export default solutionRoutes;