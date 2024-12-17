import mongoose from "mongoose";

const solutionSchema = new mongoose.Schema({
    solutionNumber: {
        type: Number,
        required: true
    },
    versionNumber: {
        type: Number,
        required: true,
        default: 1
    },
    status: {
        type: String,
        enum: ["draft", "under_review", "proposal", "public", "deprecated"],
        default: "draft",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    overview: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    proposedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    authorizedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }],
    activeSolutionElementsCount: {
        type: Number,
        required: true,
        default: 0
    },
    activeConsiderationsCount: {
        type: Number,
        required: true,
        default: 0
    },
    changeProposalFor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Solution",
        required: false
    },
    changeSummary: {
        type: String,
        required: false
    }
}, {timestamps: true});

solutionSchema.index({solutionNumber: 1, versionNumber: 1}, {unique: true});
solutionSchema.index({status: 1});
solutionSchema.index({proposedBy: 1});
solutionSchema.index({authorizedUsers: 1});

export const Solution = mongoose.model("Solution", solutionSchema);

/*
    // challengeAspects saved in solutionElements, could be drawn from there to be displayed on this level as overview. ChallengeID can derive addressed solutions as well.
    ? challengeID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Challenge",
        required: true
    }
*/