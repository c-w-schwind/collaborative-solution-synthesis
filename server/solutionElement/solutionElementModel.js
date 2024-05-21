import mongoose from "mongoose";

const solutionElementSchema = new mongoose.Schema({
    elementNumber: {
        type: Number,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['proposal', 'active', 'deprecated', 'declined'],
        default: 'proposal',
        required: true
    },
    parentSolutionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Solution'
    },
    elementType: {                          // primary = specific strategies, methods, actions
        type: String,                       // supportive = additional components that enhance the solution
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
    activeConsiderationsCount: {
        type: Number,
        required: true,
        default: 0
    },
    changeProposalFor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SolutionElement',
        required: false
    },
    /*addressing: [{    //TODO: if primary: challengeAspectsIds; if secondary: primaryElementsIds
        type: mongoose.Schema.Types.ObjectId,
        ref: ''
    }]*/
}, { timestamps: true });

export const SolutionElement = mongoose.model('SolutionElement', solutionElementSchema);