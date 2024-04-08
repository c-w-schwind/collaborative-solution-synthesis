import mongoose from "mongoose";

const discussionSpacePostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    replyingTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DiscussionSpacePost',
        required: false
    },
    parentType: {
        type: String,
        required: true,
        enum: ['Solution', 'SolutionElement']
    },
    parentNumber: {
        type: Number,
        required: true,
    }
}, { timestamps: true });

discussionSpacePostSchema.index({ parentType: 1, parentNumber: 1 });

export const DiscussionSpacePost = mongoose.model('DiscussionSpacePost', discussionSpacePostSchema);