import mongoose from "mongoose";
import {considerationCommentSchema} from './considerationCommentModel.js'

const considerationSchema = new mongoose.Schema({
    parentType: {
        type: String,
        required: true,
        enum: ['Solution', 'SolutionElement']
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'parentType'
    },
    stance: {
        type: String,
        enum: ['Pro', 'Con', 'Neutral'],
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
    comments: [considerationCommentSchema]
}, { timestamps: true });

export const Consideration = mongoose.model('Consideration', considerationSchema);