import {validateRequiredFields} from "../utils.js";
import {validateSolutionElement} from "../solutionElement/solutionElementService.js";
import {validateConsideration} from "../consideration/considerationService.js";


export async function validateSolution(solutionData, solutionElementsData, solutionConsiderationsData) {
    validateRequiredFields(solutionData, ['title', 'overview', 'description'], "Solution validation")

    if (solutionElementsData) {
        if (!Array.isArray(solutionElementsData)) {
            throw new Error("Solution elements data must be an array.");
        }
        for (const element of solutionElementsData) {
            await validateSolutionElement(element);
        }
    }

    if (solutionConsiderationsData) {
        if (!Array.isArray(solutionConsiderationsData)) {
            throw new Error("Solution considerations data must be an array.");
        }
        for (const consideration of solutionConsiderationsData) {
            await validateConsideration(consideration);
        }
    }
}