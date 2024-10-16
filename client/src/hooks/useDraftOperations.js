import {useCallback} from "react";
import {useNavigate} from "react-router-dom";
import {useLoading} from "../context/LoadingContext";
import {useToasts} from "../context/ToastContext";
import {useConfirmationModal} from "../context/ConfirmationModalContext";
import {deleteSolutionDraft} from "../services/solutionApiService";


const useDraftOperations = (solution, isSolutionDraft) => {
    const {showConfirmationModal} = useConfirmationModal();
    const {showLoading, hideLoading} = useLoading();
    const {addToast} = useToasts();
    const navigate = useNavigate();


    const deleteDraft = useCallback(async () => {
        try {
            showLoading(`Deleting Solution\n"${solution.title}"`);
            await deleteSolutionDraft(solution.solutionNumber);
            addToast(`Successfully deleted the solution draft titled "${solution.title}".`, 4000);
            navigate("/solutions");
        } catch (err) {
            console.error("Error deleting solution:", err);
            addToast(`Error: ${err.message || "An unexpected error occurred while deleting the solution. Please refresh the page and try again."}`, 6000);
        } finally {
            hideLoading();
        }
    }, [showLoading, hideLoading, addToast, navigate, solution]);


    const handleDiscardDraft = useCallback(() => {  // TODO: make generic?
        if (!isSolutionDraft) return;
        const discardDraftMessage = `You are about to permanently delete the solution draft titled "${solution.title}", along with all associated elements.${solution.status === "under_review" ? "\n\nThis draft is currently under review. If you haven't already, you may want to discuss this step with the assigned reviewers before proceeding." : ""}`;

        showConfirmationModal({
            title: "Delete Solution Draft?",
            message: discardDraftMessage,
            onConfirm: deleteDraft,
            buttonMode: "delete",
            followUp: true
        });
    }, [showConfirmationModal, solution, deleteDraft, isSolutionDraft]);


    const submitDraft = useCallback(async () => {
        try {
            showLoading(`Submitting Solution for Review\n"${solution.title}"`);
            // TODO: write route, function and implement
            addToast(`Successfully initialized review phase for solution draft "${solution.title}". Review invitations have been successfully sent out.`, 4000);
            navigate("/solutions");
        } catch (err) {
            console.error("Error submitting solution:", err);
            addToast(`Error: ${err.message || "An unexpected error occurred while submitting the solution. Please refresh the page and try again."}`, 6000);
        } finally {
            hideLoading();
        }
    }, [showLoading, hideLoading, solution, addToast, navigate]);

    const handleSubmitDraft = useCallback(() => {
        if (!isSolutionDraft) return;
        const submitDraftMessage = `You are about to submit your solution draft titled "${solution.title}" for review. A group of randomly selected users will provide feedback. Ensure you're available for questions, discussions and potential revisions during this review phase.\n\nBefore submitting, ensure that to the best of your knowledge and perspective:\n\n    - You have thoroughly considered the solution and its elements.\n    - You’ve evaluated the potential consequences and overall impact.\n\nSubmitting incomplete or underdeveloped solutions may waste community resources.\n\nDo you want to continue?`;

        showConfirmationModal({
            title: "Submit Solution Draft for Review?",
            message: submitDraftMessage,
            onConfirm: submitDraft,
            buttonMode: "submit_for_review",
            size: 600,
            followUp: true,
            followUpMessage: "Just testing the follow up message."
        });
    },[isSolutionDraft, solution, showConfirmationModal, submitDraft]);

    const publishSolution = useCallback(async () => {
        try {
            showLoading(`Publishing Solution\n"${solution.title}"`);
            // TODO: write route, function and implement
            addToast(`Successfully published the solution titled "${solution.title}".`, 4000);
            navigate("/solutions");
        } catch (err) {
            console.error("Error publishing solution:", err);
            addToast(`Error: ${err.message || "An unexpected error occurred while publishing the solution. Please refresh the page and try again."}`, 6000);
        } finally {
            hideLoading();
        }
    }, [showLoading, hideLoading, solution, addToast, navigate]);

    const handlePublishSolution = useCallback(() => {
        if (!isSolutionDraft) return;
        const publishSolutionMessage = `WARNING!\n\n\nYou are about to publish the solution titled "${solution.title}" to the entire community.\n\nPlease ensure that:\n\n    - All feedback from reviewers has been addressed.\n    - Any significant concerns have been considered and, if necessary, incorporated.\n    - You are confident that the solution is fully developed and ready for community evaluation.\n\nPublishing solutions with unresolved issues or incomplete feedback can lead to rejection and waste community resources. Make sure you’ve thought this through carefully.\n\nDo you want to proceed?`;
        showConfirmationModal({
            title: "Publish Solution Draft?",
            message: publishSolutionMessage,
            onConfirm: publishSolution,
            buttonMode: "publish",
            size: 600,
            followUp: true,
            followUpMessage: "Just another test of the follow up message!"
        });
    },[isSolutionDraft, solution, showConfirmationModal, publishSolution]);


    return {handleDiscardDraft, handleSubmitDraft, handlePublishSolution};
};

export default useDraftOperations;