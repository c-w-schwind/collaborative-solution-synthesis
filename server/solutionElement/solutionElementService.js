import {SolutionElement} from "./solutionElementModel.js";
import {validateRequiredFields} from "../utils/utils.js";
import {Solution} from "../solution/solutionModel.js";
import {BadRequestError, NotFoundError, ValidationError} from "../utils/customErrors.js";

export async function validateSolutionElement(solutionElement) {
    validateRequiredFields(solutionElement, ['parentSolution', 'title', 'overview', 'description'], "Solution element validation")

    if (!['primary', 'supportive'].includes(solutionElement.elementType)) {
        throw new BadRequestError("Invalid elementType. Must be 'primary' or 'supportive'.");
    }
    if (!['proposal', 'active'].includes(solutionElement.status)) {
        throw new ValidationError("For creation or update of a solution element, status needs to be proposal or active.");
    }
}

export async function createSolutionElements(solutionElementsData, userId, session = null) {
    const elementsData = Array.isArray(solutionElementsData) ? solutionElementsData : [solutionElementsData];
    const solutionElements = [];
    for (const elementData of elementsData) {
        const element = new SolutionElement({
            ...elementData,
            proposedBy: userId
        });
        await element.save({session});
        solutionElements.push(element);
    }
    return solutionElements;
}

export async function updateParentSolutionElementsCount(parentSolution, delta, session) {    //delta: 1 = increase, -1 = decrease
    const solutionExists = await Solution.findById(parentSolution).session(session);
    if (!solutionExists) throw new NotFoundError(`Solution with ID ${parentSolution} not found`);

    await Solution.findByIdAndUpdate(parentSolution, { $inc: { activeSolutionElementsCount: delta } }).session(session);
}