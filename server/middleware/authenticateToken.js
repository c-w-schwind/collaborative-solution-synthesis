import jwt from "jsonwebtoken";
import {UnauthorizedError} from "../utils/customErrors.js";
import {User} from "../user/userModel.js";
import {asyncHandler} from "../utils/asyncHandler.js";

const authenticateToken = (options = {required: true}) => {
    return asyncHandler(async (req, res, next) => {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

        if (!token) {
            if (!options.required) {
                req.user = null;
                return next();
            }
            throw new UnauthorizedError("Access Denied: No Token Provided");
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded._id).select("-passwordHash");

            if (!user) {
                console.warn(`Authentication failed: User with ID ${decoded._id} not found.`);
                throw new UnauthorizedError("Access Denied: User Not Found");
            }

            req.user = user;
            next();
        } catch (err) {
            if (!options.required) {
                req.user = null;
                next();
            }
            throw new UnauthorizedError("Access Denied: Invalid Token");
        }
    });
};

export default authenticateToken;