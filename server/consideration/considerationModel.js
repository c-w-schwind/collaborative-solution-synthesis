import mongoose from "mongoose";
import {ConsiderationComment} from './considerationCommentModel.js'

const considerationSchema = new mongoose.Schema({
    parentType: {
        type: String,
        required: true,
        enum: ['Solution', 'SolutionElement']
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'targetType'
    },
    stance: {
        type: String,
        enum: ['pro', 'con', 'neutral'],
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'deprecated'],
        default: 'active',
        required: true
    },
    title: {
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
    votes: {
        upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    },
    comments: [ConsiderationComment]
}, { timestamps: true });

export const Consideration = mongoose.model('Consideration', considerationSchema);