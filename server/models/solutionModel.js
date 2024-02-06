import mongoose from "mongoose";

const solutionSchema = new mongoose.Schema({
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
        ref: 'User',
        required: true
    },
    solutionElements: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SolutionElement'
    }],
    solutionConsiderations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Consideration'
    }],
    proposals: [{}]
}, { timestamps: true });

export const Solution = mongoose.model('Solution', solutionSchema);

/*
    challengeID: {  // challengeAspects saved in solution elements, can be drawn from there to be displayed on solution level as well
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Challenge',
        required: true
    },
    supportiveElements: [{   // Should we even distinguish between primary and secondary?
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SecondaryElement'
    }]
    */

    /*
        - `primaryElements` (Array of ObjectIds): References to primary elements (specific strategies, methods, actions).
        - `supportiveElements` (Array of ObjectIds): References to supportive elements (additional components that enhance the solution).
        - `solutionConsiderations` (Array of ObjectIds): References to solution considerations (assessment of potential limitations, pros, cons, and neutral points).
     */