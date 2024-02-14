import {validateSolutionElement} from "./solutionElementService.js";
import {User} from "../models/userModel.js";
import {validateConsideration} from "./considerationService.js";
import {validateRequiredFields} from "./utils.js";

export async function validateSolution(solutionData, solutionElementsData, solutionConsiderationsData, userId) {
    validateRequiredFields(solutionData, ['title', 'overview', 'description'], "Solution validation" )

    if (!await User.findById(userId)) {
        throw new Error('User not found.');
    }

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