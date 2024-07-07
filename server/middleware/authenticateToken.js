import jwt from "jsonwebtoken";
import {UnauthorizedError} from "../utils/customErrors.js";

const authenticateToken = (options = {required: true}) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

        if (!token) {
            if (options.required) {
                return next(new UnauthorizedError("Access Denied"));
            } else {
                return next(); // Allowing requests without token to proceed
            }
        }

        try {
            req.user = jwt.verify(token, process.env.JWT_SECRET);
            next();
        } catch (err) {
            if (options.required) {
                next(new UnauthorizedError("Invalid Token"));
            } else {
                req.user = null;
                next();
            }
        }
    };
};

export default authenticateToken;