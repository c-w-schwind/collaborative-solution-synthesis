import express from "express";
import {
    createConsiderations, toggleCommentVote, toggleConsiderationVote,
    updateParentConsiderationsCount,
    validateConsideration
} from "./considerationService.js";
import authenticateToken from "../middleware/authenticateToken.js";
import verifyUserExistence from "../middleware/verifyUserExistence.js";
import {Consideration} from "./considerationModel.js";

const considerationRoutes = express.Router();

// Create new Consideration
considerationRoutes.post('/consideration', authenticateToken, verifyUserExistence, async (req, res) => {
    try {
        await validateConsideration(req.body);
        const consideration = await createConsiderations(req.body, req.user._id);
        await updateParentConsiderationsCount(req.body.parentType, req.body.parentId, 1);

        res.status(201).send(consideration);
    } catch (err) {
        console.log(err);
        if (err.name === 'ValidationError') {
            return res.status(400).send({ message: err.message });
        }
        res.status(500).send({ message: 'Internal server error' });
    }
});


// Create a new comment for a Consideration
considerationRoutes.post('/consideration/:id/comment', authenticateToken, verifyUserExistence, async (req, res) => {
    try {
        if (!req.body.text) throw new Error('Consideration Comment: Missing required field: text.');

        const consideration = await Consideration.findById(req.params.id);
        if (!consideration) {
            return res.status(404).send({ message: "Consideration not found." });
        }

        const comment = {
            text: req.body.text,
            postedBy: req.user._id,
            createdAt: new Date()
        }

        consideration.comments.push(comment);
        await consideration.save();

        res.status(201).send({consideration, comment});
    } catch (err) {
        console.error("Failed to add comment:", err);
        if (err.name === 'ValidationError') {
            return res.status(400).send({ message: err.message });
        }
        res.status(500).send({ message: 'Internal server error' });
    }
});


// Vote on Consideration
considerationRoutes.post('/consideration/:id', authenticateToken, verifyUserExistence, async (req, res) => {
    try {
        const vote = req.body.vote;
        const consideration = await toggleConsiderationVote(req.params.id, req.user._id, vote);
        res.status(200).send({consideration, vote});
    } catch (err) {
        console.log(err);
        if (err.name === 'ValidationError') {
            return res.status(400).send({ message: err.message });
        }
        res.status(500).send({ message: 'Internal server error' });
    }
});


// Vote on Consideration comment
considerationRoutes.post('/consideration/:considerationId/comment/:commentId/vote', authenticateToken, verifyUserExistence, async (req, res) => {
    try {
        const vote = req.body.vote;
        const consideration = await toggleCommentVote(req.params.considerationId, req.params.commentId, req.user._id, vote);
        res.status(200).send({consideration, vote});
    } catch (err) {
        console.log(err);
        if (err.name === 'ValidationError') {
            return res.status(400).send({ message: err.message });
        }
        res.status(500).send({ message: 'Internal server error' });
    }
});

export default considerationRoutes;