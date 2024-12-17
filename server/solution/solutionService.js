import {validateRequiredFields} from "../utils/utils.js";
import {Solution} from "./solutionModel.js";
import {getNextCounterValue} from "../counters/counterService.js";


export async function createSolution(solutionInput, userId, session, originalSolutionNumber = null) {
    validateRequiredFields(solutionInput, ["title", "overview", "description"], "Solution validation")

    const newSolutionNumber = originalSolutionNumber || await getNextCounterValue("solutionCounter", session);

    const solution = new Solution({
        ...solutionInput,
        solutionNumber: newSolutionNumber,
        status: "draft",
        proposedBy: userId,
        authorizedUsers: [userId]
    });

    await solution.save({session});
    return solution;
}


export async function createSolutionChangeProposal(originalSolution, userId, session) {
    // Exclude unwanted fields
    const {authorizedUsers, _id, createdAt, updatedAt, ...rest} = originalSolution;
    const newVersionNumber = originalSolution.versionNumber + 1;

    const changeProposalData = {
        ...rest,
        versionNumber: newVersionNumber,
        activeConsiderationsCount: 0,
        changeProposalFor: originalSolution._id,
        changeSummary: "Here you should ... [Add user description]"
    };

    return createSolution(changeProposalData, userId, session, originalSolution.solutionNumber);
}