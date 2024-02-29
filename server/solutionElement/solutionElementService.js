import {SolutionElement} from "./solutionElementModel.js";
import {validateRequiredFields} from "../utils/utils.js";
import {Solution} from "../solution/solutionModel.js";
import {BadRequestError, NotFoundError, ValidationError} from "../utils/customErrors.js";

export async function validateSolutionElementInput(solutionElementInput) {
    validateRequiredFields(solutionElementInput, ['parentSolution', 'title', 'overview', 'description'], "Solution element validation")

    if (!['primary', 'supportive'].includes(solutionElementInput.elementType)) {
        throw new BadRequestError("Invalid elementType. Must be 'primary' or 'supportive'.");
    }
    if (!['proposal', 'active'].includes(solutionElementInput.status)) {
        throw new ValidationError("For creation or update of a solution element, status needs to be proposal or active.");
    }
}

export async function createSolutionElements(solutionElementInput, userId, session = null) {
    const solutionElementsData = Array.isArray(solutionElementInput) ? solutionElementInput : [solutionElementInput];
    const solutionElements = [];
    for (const solutionElementData of solutionElementsData) {
        const solutionElement = new SolutionElement({
            ...solutionElementData,
            proposedBy: userId
        });
        await solutionElement.save({session});
        solutionElements.push(solutionElement);
    }
    return solutionElements;
}

export async function updateParentSolutionElementsCount(parentSolution, delta, session) {    //delta: 1 = increase, -1 = decrease
    const solutionExists = await Solution.findById(parentSolution).session(session);
    if (!solutionExists) throw new NotFoundError(`Solution with ID ${parentSolution} not found`);

    await Solution.findByIdAndUpdate(parentSolution, { $inc: { activeSolutionElementsCount: delta } }).session(session);
}