import jwt from "jsonwebtoken";
import {UnauthorizedError} from "../utils/customErrors.js";
import {User} from "../user/userModel.js";
import {asyncHandler} from "../utils/asyncHandler.js";

function authenticateToken (required = true) {
    return asyncHandler(async (req, res, next) => {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

        if (!token) {
            if (!required) {
                req.user = null;
                return next();
            }
            throw new UnauthorizedError("Access Denied: No Token Provided");
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            if (!required) {
                req.user = null;
                return next();
            }

            throw new UnauthorizedError("Access Denied: Invalid Token");
        }

        const user = await User.findById(decoded._id).select("-passwordHash");

        if (!user) {
            console.warn(`Authentication failed: User with ID ${decoded._id} not found.`);
            if (!required) {
                req.user = null;
                return next();
            }
            throw new UnauthorizedError("Access Denied: User Not Found");
        }

        req.user = user;
        return next();
    });
}

const requiredAuth = authenticateToken();
const optionalAuth = authenticateToken(false);

export {requiredAuth, optionalAuth};