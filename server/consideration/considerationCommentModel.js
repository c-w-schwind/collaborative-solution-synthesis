import mongoose from "mongoose";

const considerationCommentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    votes: {
        upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const ConsiderationComment = mongoose.model('ConsiderationComment', considerationCommentSchema);