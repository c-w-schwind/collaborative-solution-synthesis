import {SolutionElement} from "./solutionElementModel.js";
import {validateRequiredFields} from "../utils/utils.js";
import {Solution} from "../solution/solutionModel.js";
import {BadRequestError, NotFoundError, ValidationError} from "../utils/customErrors.js";

function validateSolutionElementData(solutionElementData) {
         validateRequiredFields(solutionElementData, ['status', 'parentSolution', 'elementType', 'title', 'overview', 'description'], "Solution element validation")

         if (!['proposal', 'active'].includes(solutionElementData.status)) {
             throw new ValidationError("For creation or update of a solution element, status needs to be proposal or active.");
         }

         if (!['primary', 'supportive'].includes(solutionElementData.elementType)) {
             throw new BadRequestError("Invalid elementType. Must be 'primary' or 'supportive'.");
         }
}

async function createSolutionElement(solutionElementData, userId, session = null) {
    const solutionElement = new SolutionElement({
        ...solutionElementData,
        proposedBy: userId
    });
    await solutionElement.save({session});
    return solutionElement;
}

export async function validateAndCreateSolutionElements (solutionElementsData, parentSolutionId, userId, session = null) {
    if (!solutionElementsData) return [];

    solutionElementsData = Array.isArray(solutionElementsData) ? solutionElementsData : [solutionElementsData];

    const returnedPromises = solutionElementsData.map(solutionElementData => {
        solutionElementData = ({ ...solutionElementData, parentSolutionId });
        validateSolutionElementData(solutionElementData);
        return createSolutionElement(solutionElementData, userId, session);
    })

    return Promise.all(returnedPromises);
}

export async function updateParentSolutionElementsCount(parentSolution, delta, session) {    //delta: 1 = increase, -1 = decrease
    const solutionExists = await Solution.findById(parentSolution).session(session);
    if (!solutionExists) throw new NotFoundError(`Solution with ID ${parentSolution} not found`);

    await Solution.findByIdAndUpdate(parentSolution, { $inc: { activeSolutionElementsCount: delta } }).session(session);
}