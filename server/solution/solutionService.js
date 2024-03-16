import {validateRequiredFields} from "../utils/utils.js";
import {Solution} from "./solutionModel.js";
import {getNextCounterValue} from "../counters/counterService.js";


export async function validateAndCreateSolution(solutionInput, userId, session) {
    validateRequiredFields(solutionInput, ['title', 'overview', 'description'], "Solution validation")

    const solutionCounterValue = await getNextCounterValue("solutionCounter", session)

    return new Solution({
        solutionNumber: solutionCounterValue,
        title: solutionInput.title,
        overview: solutionInput.overview,
        description: solutionInput.description,
        proposedBy: userId
    });
}