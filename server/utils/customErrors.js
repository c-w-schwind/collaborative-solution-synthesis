export class BadRequestError extends Error {
    constructor(message = 'Bad Request') {
        super(message);
        this.name = 'BadRequestError';
        this.statusCode = 400;
    }
}

export class ValidationError extends Error {
    constructor(message = 'Validation Error') {
        super(message);
        this.name = 'ValidationError';
        this.statusCode = 400;
    }
}

export class UnauthorizedError extends Error {
    constructor(message = 'Unauthorized') {
        super(message);
        this.name = "UnauthorizedError";
        this.statusCode = 401;
    }
}

export class NotFoundError extends Error {
    constructor(message = 'Not Found') {
        super(message);
        this.name = 'NotFoundError';
        this.statusCode = 404;
    }
}

export class ConflictError extends Error {
    constructor(message = 'Conflict') {
        super(message);
        this.name = 'ConflictError';
        this.statusCode = 409;
    }
}