import {validateRequiredFields} from "../utils/utils.js";
import {Solution} from "./solutionModel.js";


export function validateAndCreateSolution(solutionInput, userId) {
    validateRequiredFields(solutionInput, ['title', 'overview', 'description'], "Solution validation")

    return new Solution({
        title: solutionInput.title,
        overview: solutionInput.overview,
        description: solutionInput.description,
        proposedBy: userId,
    });
}