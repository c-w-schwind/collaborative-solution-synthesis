import {Solution} from "../solution/solutionModel.js";
import {SolutionElement} from "../solutionElement/solutionElementModel.js";
import {BadRequestError, NotFoundError} from "../utils/customErrors.js";
import {asyncHandler} from "../utils/asyncHandler.js";

const modelMap = {
    "Solution": Solution,
    "SolutionElement": SolutionElement,
};

const fieldMap = {
    "Solution": "solutionNumber",
    "SolutionElement": "elementNumber",
};

const translateEntityNumberToId = (entityType, entityNum, versionNum = null, idKey = "entityId") => asyncHandler(async (req, res, next) => {
    const entityNumber = parseInt(entityNum, 10);
    if (!entityType || isNaN(entityNumber)) throw new BadRequestError("Entity type or entity number missing or invalid");

    const model = modelMap[entityType];
    if (!model) throw new BadRequestError(`Unknown entity type: ${entityType}`);

    const entityNumberField = fieldMap[entityType];
    if (!entityNumberField) throw new BadRequestError(`Field mapping for ${entityType} not found`);

    let query = {[entityNumberField]: entityNumber};

    if (versionNum !== null) {
        const versionNumber = parseInt(versionNum, 10);
        if (isNaN(versionNumber)) throw new BadRequestError("Invalid version number");
        query.versionNumber = versionNumber;
    } else {
        // Fetch the latest established version
        query.status = entityType === "Solution" ? "public" : "accepted";
    }

    const entity = await model.findOne(query).select("_id").lean();
    if (!entity) throw new NotFoundError(`${entityType} not found`);

    req[idKey] = entity._id.toString();
    next();
});


export default translateEntityNumberToId;