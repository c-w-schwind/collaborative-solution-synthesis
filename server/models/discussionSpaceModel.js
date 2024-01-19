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
    date: {
        type: Date,
        required: true
    },
    replyingTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DiscussionSpacePost',
        required: false
    }
});

export const DiscussionSpacePost = mongoose.model('DiscussionSpacePost', discussionSpacePostSchema);
