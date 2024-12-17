import mongoose from "mongoose";

const solutionElementSchema = new mongoose.Schema({
    elementNumber: {
        type: Number,
        required: true
    },
    versionNumber: {
        type: Number,
        required: true,
        default: 1
    },
    parentSolutionNumber: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'under_review', 'proposal', 'accepted', 'rejected', 'deprecated'],
        default: 'draft',
        required: true
    },
    elementType: {                          // primary = specific strategies, methods, actions
        type: String,                       // supportive = additional components that enhance the solution
        enum: ['Primary', 'Supportive'],
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
    authorizedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
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
    changeSummary: {
        type: String,
        required: false
    }
    /*addressing: [{    //TODO: if primary: challengeAspectsIds; if secondary: primaryElementsIds
        type: mongoose.Schema.Types.ObjectId,
        ref: ''
    }]*/
}, {timestamps: true});

solutionElementSchema.index({elementNumber: 1, versionNumber: 1}, {unique: true});
solutionElementSchema.index({status: 1});
solutionElementSchema.index({proposedBy: 1});
solutionElementSchema.index({authorizedUsers: 1});
solutionElementSchema.index({parentSolutionNumber: 1});

export const SolutionElement = mongoose.model('SolutionElement', solutionElementSchema);