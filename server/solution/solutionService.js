import {ValidationError} from "../utils/customErrors.js";
import {validateRequiredFields} from "../utils/utils.js";
import {validateSolutionElementInput} from "../solutionElement/solutionElementService.js";
import {validateConsiderationInput} from "../consideration/considerationService.js";


export async function validateSolutionInput(solutionInput, solutionElementInput, solutionConsiderationInput) {
    validateRequiredFields(solutionInput, ['title', 'overview', 'description'], "Solution validation")

    if (solutionElementInput) {
        if (!Array.isArray(solutionElementInput)) {
            throw new ValidationError("Solution element input must be an array.");
        }
        for (const solutionElement of solutionElementInput) {
            await validateSolutionElementInput(solutionElement);
        }
    }

    if (solutionConsiderationInput) {
        if (!Array.isArray(solutionConsiderationInput)) {
            throw new ValidationError("Solution consideration input must be an array.");
        }
        for (const consideration of solutionConsiderationInput) {
            await validateConsiderationInput(consideration);
        }
    }
}