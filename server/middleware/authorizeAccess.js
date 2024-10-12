import {Solution} from "../solution/solutionModel.js";
import {SolutionElement} from "../solutionElement/solutionElementModel.js";
import {BadRequestError, NotFoundError, UnauthorizedError} from "../utils/customErrors.js";
import {asyncHandler} from "../utils/asyncHandler.js";

const modelMap = {
    "Solution": Solution,
    "SolutionElement": SolutionElement,
};

const authorizeAccess = (entityType, options = {}) => {
    // Divergent entityIdField is used for checking solution access when creating element
    const {entityIdField = "entityId", requireAuthor = false} = options;

    return asyncHandler(async (req, res, next) => {
        const entityId = req[entityIdField];
        if (!entityId) return next(new BadRequestError("Entity ID is missing from the request"));

        const model = modelMap[entityType];
        if (!model) return next(new BadRequestError(`Unknown entity type: ${entityType}`));

        const entity = await model.findById(entityId).populate("proposedBy", "username").lean();
        if (!entity) return next(new NotFoundError(`${entityType} not found`));

        if (requireAuthor) {
            if (!req.user || entity.proposedBy._id.toString() !== req.user._id.toString()) {
                return next(new UnauthorizedError("Access Denied: Only the author can perform this action"));
            }
        } else if (entity.status === "draft" || entity.status === "under_review") {
            // When entityIdField is "parentSolutionId" access for adding an Element to a Solution draft is authorized, so reviewers will be blocked
            if (entityIdField === "parentSolutionId" && (entity.proposedBy._id.toString() !== req.user._id.toString())) {
                return next(new UnauthorizedError("Access Denied: Only the author of a Solution draft can add Elements"));
            } else if (!req.user || !entity.authorizedUsers.some(authUserId => authUserId.equals(req.user._id))) {
                return next(new UnauthorizedError("Access Denied"));
            }
        }

        req.entity = entity;

        next();
    });
};

export default authorizeAccess;