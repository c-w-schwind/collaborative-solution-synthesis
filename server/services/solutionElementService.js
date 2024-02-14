import {SolutionElement} from "../models/solutionElementModel.js";
import {validateRequiredFields} from "./utils.js";

export async function validateSolutionElement(solutionElement) {
    validateRequiredFields(solutionElement, ['elementType', 'title', 'overview', 'description'], "Solution element validation")

    if (!['primary', 'supportive'].includes(solutionElement.elementType)) {
        throw new Error("Invalid elementType. Must be 'primary' or 'supportive'.");
    }
}

export async function createSolutionElements(solutionElementsData, userId, session = null) {
    const elementsData = Array.isArray(solutionElementsData) ? solutionElementsData : [solutionElementsData];
    try {
        const solutionElementsIds = [];
        for (const elementData of elementsData) {
            const element = new SolutionElement({
                ...elementData,
                proposedBy: userId
            });
            await element.save({ session });
            solutionElementsIds.push(element._id);
        }
        return solutionElementsIds;
    } catch (err) {
        console.error("Failed to create solution element(s):", err);
        throw err;
    }
}