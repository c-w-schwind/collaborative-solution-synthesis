import {BadRequestError} from "./customErrors.js";

export function validateRequiredFields(data, requiredFields, context) {
    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
        throw new BadRequestError(`${context}: Missing required field(s): ${missingFields.join(', ')}.`);
    }
}

export function validateEmail(email) {
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailRegex.test(email)) {
        throw new BadRequestError('Invalid email format.');
    }
}