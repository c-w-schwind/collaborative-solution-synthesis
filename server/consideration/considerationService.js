import {validateRequiredFields} from "../utils/utils.js";
import {BadRequestError, NotFoundError} from "../utils/customErrors.js";
import {Consideration} from "./considerationModel.js";
import {SolutionElement} from "../solutionElement/solutionElementModel.js";
import {Solution} from "../solution/solutionModel.js";


export async function validateParentDocument(parentType, parentId) {
    if (!['Solution', 'SolutionElement'].includes(parentType)) {
        throw new BadRequestError("Invalid parent type. Must be 'Solution', or 'SolutionElement'.");
    }
    const Model = parentType === 'Solution' ? Solution : SolutionElement;
    if (!await Model.exists({_id: parentId})) {
        throw new NotFoundError(`${parentType} not found.`);
    }
}

function validateConsiderationData(considerationData) {
    validateRequiredFields(considerationData, ['parentType', 'parentId', 'stance', 'title', 'description'], "Consideration validation");

    if (!['pro', 'con', 'neutral'].includes(considerationData.stance)) {
        throw new BadRequestError("Invalid stance. Must be 'pro', 'con', or 'neutral'.");
    }
}

async function createConsideration(considerationData, userId, session = null) {
    const consideration = new Consideration({
        ...considerationData,
        proposedBy: userId
    });
    await consideration.save({session});
    return consideration;
}

export async function validateAndCreateConsiderations(considerationsData, parentType, parentId, userId, session = null) {
    if (!considerationsData) return [];

    considerationsData = Array.isArray(considerationsData) ? considerationsData : [considerationsData];

    const considerationPromises = considerationsData.map(considerationData => {
        considerationData = { ...considerationData, parentType, parentId };
        validateConsiderationData(considerationData);
        return createConsideration(considerationData, userId, session);
    });

    return await Promise.all(considerationPromises);
}


export async function updateParentConsiderationsCount(parentType, parentId, delta, session) {    //delta: 1 = increase, -1 = decrease
    if (parentType === 'SolutionElement') {
        await SolutionElement.findByIdAndUpdate(parentId, { $inc: { activeConsiderationsCount: delta } }).session(session);
    } else if (parentType === 'Solution') {
        await Solution.findByIdAndUpdate(parentId, { $inc: { activeConsiderationsCount: delta } }).session(session);
    }
}

async function validateAndToggleVote(item, userId, voteType) {
    if (!['upvote', 'downvote'].includes(voteType)) throw new BadRequestError("Invalid vote type. Must be 'upvote' or 'downvote'.");

    const upvotes = item.votes.upvotes.map(id => id.toString());
    const downvotes = item.votes.downvotes.map(id => id.toString());

    const hasUpvoted = upvotes.includes(userId);
    const hasDownvoted = downvotes.includes(userId);

    if (voteType === 'upvote') {
        if (hasUpvoted) {
            item.votes.upvotes.pull(userId);
        } else {
            item.votes.upvotes.push(userId);
            if (hasDownvoted) item.votes.downvotes.pull(userId);
        }
    } else if (voteType === 'downvote') {
        if (hasDownvoted) {
            item.votes.downvotes.pull(userId);
        } else {
            item.votes.downvotes.push(userId);
            if (hasUpvoted) item.votes.upvotes.pull(userId);
        }
    }
    if (item instanceof Consideration) await item.save();
}

export async function toggleConsiderationVote(considerationId, userId, voteType) {
    const consideration = await Consideration.findById(considerationId);
    if (!consideration) throw new NotFoundError('Consideration not found');
    await validateAndToggleVote(consideration, userId, voteType);
    return consideration;
}

export async function toggleCommentVote(considerationId, commentId, userId, voteType) {
    const consideration = await Consideration.findById(considerationId);
    if (!consideration) throw new NotFoundError('Consideration not found');

    const comment = consideration.comments.id(commentId);
    if (!comment) throw new NotFoundError('Comment not found');

    await validateAndToggleVote(comment, userId, voteType);

    await consideration.save();
    return comment;
}

export function groupAndSortConsiderationsByStance(considerations) {
    const groupedConsiderations = {pro: [], con: [], neutral: []};

    considerations.forEach(consideration => {
        consideration.netScore = consideration.votes.upvotes.length - consideration.votes.downvotes.length;
        if (consideration.stance === 'pro') {
            groupedConsiderations.pro.push(consideration);
        } else if (consideration.stance === 'con') {
            groupedConsiderations.con.push(consideration);
        } else if (consideration.stance === 'neutral') {
            groupedConsiderations.neutral.push(consideration);
        }
    });

    Object.keys(groupedConsiderations).forEach(stance => {
        groupedConsiderations[stance].sort((a, b) => b.netScore - a.netScore);
    });

    return groupedConsiderations;
}