import express from "express";
import authenticateToken from "../middleware/authenticateToken.js";
import {createSolutionElements, validateSolutionElement} from "./solutionElementService.js";
import verifyUserExistence from "../middleware/verifyUserExistence.js";

const solutionElementRoutes = express.Router();

// Create new solution element
solutionElementRoutes.post('/solutionElements', authenticateToken, verifyUserExistence, async (req, res) => {
    try {
        await validateSolutionElement(req.body);
        const solutionElement = await createSolutionElements(req.body, req.user._id);
        return res.status(201).send(solutionElement);
    } catch (err) {
        console.log(err);
        if (err.name === 'ValidationError') {
            return res.status(400).send({ message: err.message });
        }
        res.status(500).send({ message: 'Internal server error' });
    }
});

export default solutionElementRoutes;