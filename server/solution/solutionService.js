import {ValidationError} from "../utils/customErrors.js";
import {validateRequiredFields} from "../utils/utils.js";
import {validateSolutionElement} from "../solutionElement/solutionElementService.js";
import {validateConsideration} from "../consideration/considerationService.js";


export async function validateSolution(solutionData, solutionElementsData, solutionConsiderationsData) {
    validateRequiredFields(solutionData, ['title', 'overview', 'description'], "Solution validation")

    if (solutionElementsData) {
        if (!Array.isArray(solutionElementsData)) {
            throw new ValidationError("Solution elements data must be an array.");
        }
        for (const element of solutionElementsData) {
            await validateSolutionElement(element);
        }
    }

    if (solutionConsiderationsData) {
        if (!Array.isArray(solutionConsiderationsData)) {
            throw new ValidationError("Solution considerations data must be an array.");
        }
        for (const consideration of solutionConsiderationsData) {
            await validateConsideration(consideration);
        }
    }
}