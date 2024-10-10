import mongoose from "mongoose";

const solutionElementHistorySchema = new mongoose.Schema({
    currentElementId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SolutionElement',
        required: true
    },
    elementType: {
        type: String,
        enum: ['primary', 'supportive'],
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
        type: String,
        required: true
    },
    proposedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    considerations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Consideration'
    }],
    proposals: [{}],
    challengeAspects: {}
}, {timestamps: true});

export const SolutionElementHistory = mongoose.model('SolutionElementHistory', solutionElementHistorySchema);