import {Solution} from "../solution/solutionModel.js";
import {SolutionElement} from "../solutionElement/solutionElementModel.js";
import {BadRequestError, NotFoundError} from "../utils/customErrors.js";

const modelMap = {
    "Solution": Solution,
    "SolutionElement": SolutionElement,
};

const fieldMap = {
    "Solution": "solutionNumber",
    "SolutionElement": "elementNumber",
};

const translateEntityNumberToId = (entityType, entityNum, idKey = "entityId") => async (req, res, next) => {
    try {
        const entityNumber = parseInt(entityNum, 10);
        if (!entityType || isNaN(entityNumber)) throw new BadRequestError("Entity type or entity number missing or invalid");

        const model = modelMap[entityType];
        if (!model) throw new BadRequestError(`Unknown entity type: ${entityType}`);

        const entityNumberField = fieldMap[entityType];
        if (!entityNumberField) throw new BadRequestError(`Field mapping for ${entityType} not found`);

        const entity = await model.findOne({[entityNumberField]: entityNumber});
        if (!entity) throw new NotFoundError(`${entityType} not found`);

        req[idKey] = entity._id.toString();
        next();
    } catch (error) {
        next(error);
    }
};

export default translateEntityNumberToId;