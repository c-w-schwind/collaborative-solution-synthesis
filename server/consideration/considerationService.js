import {BadRequestError, NotFoundError} from "../utils/customErrors.js";
import {Consideration} from "./considerationModel.js";
import {SolutionElement} from "../solutionElement/solutionElementModel.js";
import {Solution} from "../solution/solutionModel.js";
import {validateRequiredFields} from "../utils/utils.js";

export async function validateConsiderationInput(considerationInput) {
    validateRequiredFields(considerationInput, ['parentType', 'parentId', 'stance', 'title', 'description'], "Consideration validation");

    if (!['pro', 'con', 'neutral'].includes(considerationInput.stance)) {
        throw new BadRequestError("Invalid stance. Must be 'pro', 'con', or 'neutral'.");
    }
}

export async function createConsiderations(considerationInput, author, session = null) {
    const considerationsData = Array.isArray(considerationInput) ? considerationInput : [considerationInput];
    const considerations = [];
    for (const considerationData of considerationsData) {
        const consideration = new Consideration({
            ...considerationData,
            proposedBy: author
        });
        await consideration.save({session});
        considerations.push(consideration);
    }
    return considerations;
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

    await item.save();
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
    return consideration;
}