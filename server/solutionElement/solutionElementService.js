import {SolutionElement} from "./solutionElementModel.js";
import {validateRequiredFields} from "../utils/utils.js";
import {Solution} from "../solution/solutionModel.js";
import {BadRequestError, NotFoundError} from "../utils/customErrors.js";
import {getNextCounterValue} from "../counters/counterService.js";


export async function createSolutionElement(elementInput, userId, session = null, elementNumberOverride = null) {
    validateRequiredFields(elementInput, ['parentSolutionNumber', 'elementType', 'title', 'overview', 'description'], "Solution element validation");

    if (!['Primary', 'Supportive'].includes(elementInput.elementType)) {
        throw new BadRequestError("Invalid elementType. Must be 'Primary' or 'Supportive'.");
    }

    const elementNumber = elementNumberOverride || await getNextCounterValue("elementCounter", session);

    const solutionElement = new SolutionElement({
        ...elementInput,
        elementNumber: elementNumber,
        status: 'draft',
        proposedBy: userId,
        authorizedUsers: [userId]
    });

    await solutionElement.save({session});
    return solutionElement;
}


export async function createSolutionElementChangeProposal(originalElement, userId, session) {
    // Exclude unwanted fields
    const {authorizedUsers, _id, createdAt, updatedAt, ...rest} = originalElement;
    const newVersionNumber = originalElement.versionNumber + 1;

    const changeProposalData = {
        ...rest,
        versionNumber: newVersionNumber,
        activeConsiderationsCount: 0,
        changeProposalFor: originalElement._id,
        changeSummary: "Here you should ... [Add user description]"
    };

    return createSolutionElement(changeProposalData, userId, session, originalElement.elementNumber);
}


export async function updateParentSolutionElementsCount(parentSolutionId, delta, session) {    //delta: 1 = increase, -1 = decrease
    const solutionExists = await Solution.findById(parentSolutionId).session(session);
    if (!solutionExists) throw new NotFoundError(`Solution with ID ${parentSolutionId} not found`);

    await Solution.findByIdAndUpdate(parentSolutionId, {$inc: {activeSolutionElementsCount: delta}}).session(session);
}