import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/customErrors.js';

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) return next(new UnauthorizedError('Access Denied'));

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        next(new UnauthorizedError('Invalid Token'));
    }
};

export default authenticateToken;