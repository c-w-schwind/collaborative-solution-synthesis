import {BadRequestError} from "./customErrors.js";

export function validateRequiredFields(data, requiredFields, context) {
    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
        throw new BadRequestError(`${context}: Missing required field(s): ${missingFields.join(', ')}.`);
    }
}
