import {BadRequestError, NotFoundError, ValidationError} from "../utils/customErrors.js";


function errorMiddleware(err, req, res, next) {
    console.log("Error: ", err);

    const isDevelopment = process.env.NODE_ENV === 'development';
    const errorResponse = {
        message: err.message,
        ...(isDevelopment && { stack: err.stack || 'No stack trace' })
    };

    if (err instanceof NotFoundError || err instanceof BadRequestError || err instanceof ValidationError) {
        return res.status(err.statusCode).send(errorResponse);
    } else {
        console.error(err);
        return res.status(500).send(errorResponse);
    }
}

export default errorMiddleware;