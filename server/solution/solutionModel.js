import mongoose from "mongoose";

const solutionSchema = new mongoose.Schema({
    solutionNumber: {
        type: Number,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ["draft", "public"],
        default: "proposal",
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
    activeSolutionElementsCount: {
        type: Number,
        required: true,
        default: 0
    },
    activeConsiderationsCount: {
        type: Number,
        required: true,
        default: 0
    }
}, { timestamps: true });

export const Solution = mongoose.model("Solution", solutionSchema);

/*
    // challengeAspects saved in solutionElements, could be drawn from there to be displayed on this level as overview. ChallengeID can derive addressed solutions as well.
    ? challengeID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Challenge",
        required: true
    }
*/