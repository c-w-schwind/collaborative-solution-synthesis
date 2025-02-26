import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    avatarUrl: {
        type: String,
        default: ""
    }
});

UserSchema.virtual("profilePicture").get(function () {
    return this.avatarUrl || `https://api.dicebear.com/9.x/shapes/svg?backgroundType=gradientLinear&seed=${encodeURIComponent(this.username)}`;
});

UserSchema.set("toJSON", {virtuals: true});
UserSchema.set("toObject", {virtuals: true});

export const User = mongoose.model('User', UserSchema);