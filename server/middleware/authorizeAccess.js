import {Solution} from "../solution/solutionModel.js";
import {SolutionElement} from "../solutionElement/solutionElementModel.js";
import {BadRequestError, NotFoundError, UnauthorizedError} from "../utils/customErrors.js";

const authorizeAccess = (entityType, entityIdField = "entityId") => { //entityType = "Solution" or "SolutionElement"; entityIdField for checking solution access when creating element
    return async (req, res, next) => {
        let entity;
        const entityId = req[entityIdField];

        if (entityType === "Solution") {
            entity = await Solution.findById(entityId);
        } else if (entityType === "SolutionElement") {
            entity = await SolutionElement.findById(entityId);
        } else {
            return next(new BadRequestError("Invalid entity type for authorization"));
        }

        if (!entity) {
            return next(new NotFoundError(`${entityType} not found`));
        }

        if (["draft", "under_review"].includes(entity.status)) {
            if (!req.user || !entity.authorizedUsers.some(authUserId => authUserId.equals(req.user._id))) {
                return next(new UnauthorizedError("Access Denied"));
            }
        }

        next();
    };
};

export default authorizeAccess;
