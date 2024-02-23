export function validateRequiredFields(data, requiredFields, context) {
    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
        throw new Error(`${context}: Missing required field(s): ${missingFields.join(', ')}.`);
    }
}
