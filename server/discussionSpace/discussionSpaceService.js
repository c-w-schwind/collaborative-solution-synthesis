import {Solution} from "../solution/solutionModel.js";
import {SolutionElement} from "../solutionElement/solutionElementModel.js";
import {BadRequestError, NotFoundError} from "../utils/customErrors.js";

export const getEstablishedEntityVersionNumber = async (parentType, parentNumber) => {
    let establishedEntity;

    if (parentType === "Solution") {
        establishedEntity = await Solution.findOne({solutionNumber: parentNumber, status: "public"})
            .select("versionNumber")
            .lean();
    } else if (parentType === "SolutionElement") {
        establishedEntity = await SolutionElement.findOne({elementNumber: parentNumber, status: "accepted"})
            .select("versionNumber")
            .lean();
    } else {
        throw new BadRequestError("Invalid parentType provided.");
    }

    if (!establishedEntity) {
        throw new NotFoundError(`${parentType} with number ${parentNumber} not found.`);
    }

    return establishedEntity.versionNumber;
};