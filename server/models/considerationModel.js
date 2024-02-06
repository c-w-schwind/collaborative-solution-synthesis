import mongoose from "mongoose";

const considerationSchema = new mongoose.Schema({
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
    }
}, { timestamps: true });

export const Consideration = mongoose.model('Consideration', considerationSchema);