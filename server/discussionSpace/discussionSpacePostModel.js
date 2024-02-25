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
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'targetType'
    }
}, { timestamps: true });

discussionSpacePostSchema.index({ discussionSpaceTargetType: 1, discussionSpaceTargetId: 1 });

export const DiscussionSpacePost = mongoose.model('DiscussionSpacePost', discussionSpacePostSchema);