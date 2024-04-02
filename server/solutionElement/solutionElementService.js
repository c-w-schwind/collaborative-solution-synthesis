import {SolutionElement} from "./solutionElementModel.js";
import {validateRequiredFields} from "../utils/utils.js";
import {Solution} from "../solution/solutionModel.js";
import {BadRequestError, NotFoundError} from "../utils/customErrors.js";
import {getNextCounterValue} from "../counters/counterService.js";

function validateSolutionElementData(solutionElementData) {
    validateRequiredFields(solutionElementData, ['parentSolutionId', 'elementType', 'title', 'overview', 'description'], "Solution element validation")

    if (!['primary', 'supportive'].includes(solutionElementData.elementType)) {
        throw new BadRequestError("Invalid elementType. Must be 'primary' or 'supportive'.");
    }
}

async function createSolutionElement(solutionElementData, userId, session = null) {
    const elementCounterValue = await getNextCounterValue("elementCounter", session)

    const solutionElement = new SolutionElement({
        ...solutionElementData,
        elementNumber: elementCounterValue,
        status: 'proposal',
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