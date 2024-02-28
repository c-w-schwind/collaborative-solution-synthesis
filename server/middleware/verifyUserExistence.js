import {asyncHandler} from "../utils/asyncHandler.js";
import { NotFoundError } from "../utils/customErrors.js";
import { User } from "../user/userModel.js";

const verifyUserExistence = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
        throw new NotFoundError('User not found.');
    }

    next();
});

export default verifyUserExistence;