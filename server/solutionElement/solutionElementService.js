import {SolutionElement} from "./solutionElementModel.js";
import {validateRequiredFields} from "../utils.js";
import {Solution} from "../solution/solutionModel.js";

export async function validateSolutionElement(solutionElement) {
    validateRequiredFields(solutionElement, ['solutionId', 'title', 'overview', 'description'], "Solution element validation")

    if (!['primary', 'supportive'].includes(solutionElement.elementType)) {
        throw new Error("Invalid elementType. Must be 'primary' or 'supportive'.");
    }
    if (!['proposal', 'active'].includes(solutionElement.status)) {
        throw new Error("For creation or update of a solution element, status needs to be proposal or active.");
    }
}

export async function createSolutionElements(solutionElementsData, userId, session = null) {
    const elementsData = Array.isArray(solutionElementsData) ? solutionElementsData : [solutionElementsData];
    try {
        const solutionElements = [];
        for (const elementData of elementsData) {
            const element = new SolutionElement({
                ...elementData,
                proposedBy: userId
            });
            await element.save({ session });
            solutionElements.push(element);
        }
        return solutionElements;
    } catch (err) {
        console.error("Failed to create solution element(s):", err);
        throw err;
    }
}

export async function updateParentSolutionElementsCount(solutionId, delta, session) {    //delta: 1 = increase, -1 = decrease
        await Solution.findByIdAndUpdate(solutionId, { $inc: { activeSolutionElementsCount: delta } }).session(session);
}