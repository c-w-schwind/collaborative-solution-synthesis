import {BadRequestError, ValidationError, UnauthorizedError, NotFoundError, ConflictError} from "../utils/customErrors.js";


function errorMiddleware(err, req, res) {
    console.log("Error: ", err);

    const isDevelopment = process.env.NODE_ENV === 'development';
    const errorResponse = {
        message: err.message,
        ...(isDevelopment && {stack: err.stack || 'No stack trace'})
    };

    if (err instanceof BadRequestError || err instanceof ValidationError || err instanceof UnauthorizedError || err instanceof NotFoundError || err instanceof ConflictError) {
        return res.status(err.statusCode).send(errorResponse);
    } else {
        console.error(err);
        return res.status(500).send(errorResponse);
    }
}

export default errorMiddleware;