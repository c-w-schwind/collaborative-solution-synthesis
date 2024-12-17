import {useCallback} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {useLoading} from "../context/LoadingContext";
import {useToasts} from "../context/ToastContext";
import {useConfirmationModal} from "../context/ConfirmationModalContext";
import {handleRequest} from "../services/solutionApiService";
import {useGlobal} from "../context/GlobalContext";


const useElementDraftOperations = (elementProps, isElementDraft, isChangeProposal) => {
    const {showConfirmationModal} = useConfirmationModal();
    const {showLoading, hideLoading} = useLoading();
    const {addToast} = useToasts();
    const navigate = useNavigate();
    const location = useLocation();
    const {setElementListChange} = useGlobal();
    const {elementNumber, elementVersion, title, status} = elementProps;

    const deleteElementDraft = useCallback(async () => {
        try {
            showLoading(`Deleting ${isChangeProposal ? "Change Proposal" : "Solution Element"}\n"${title}"`);
            await handleRequest("DELETE", "element", elementNumber, elementVersion);
            setElementListChange({
                changeType: "delete",
                elementNumber: Number(elementNumber),
                versionNumber: Number(elementVersion)
            });
            addToast(`Successfully deleted the ${isChangeProposal ? "change proposal" : "element"} draft titled "${title}".`, 4000);
            navigate(location.state?.fromElementCard || location.state?.fromCreation ? -1 : "../../..", {relative: "path"});
        } catch (err) {
            console.error("Error deleting element:", err);
            setElementListChange(null);
            addToast(`Error: ${err.message || "An unexpected error occurred while deleting the element. Please refresh the page and try again."}`, 6000);
        } finally {
            hideLoading();
        }
    }, [showLoading, isChangeProposal, hideLoading, addToast, setElementListChange, navigate, elementNumber, elementVersion, title, location.state?.fromElementCard, location.state?.fromCreation]);


    const handleDiscardElementDraft = useCallback(() => {
        if (!isElementDraft) return;
        const discardDraftMessage = `This will permanently delete the ${isChangeProposal ? "change proposal" : "element"} draft titled "${title}".${status === "under_review" ? "\n\nSince it’s currently under review, consider discussing this decision with reviewers first. Once deleted, this action cannot be undone." : ""}`;

        showConfirmationModal({
            title: `Delete ${isChangeProposal ? "Change Proposal" : "Solution Element"} Draft?`,
            message: discardDraftMessage,
            onConfirm: deleteElementDraft,
            buttonMode: "delete",
            followUp: true
        });
    }, [showConfirmationModal, title, status, deleteElementDraft, isElementDraft, isChangeProposal]);

    const submitElementDraft = useCallback(async () => {
        try {
            showLoading(`Submitting ${isChangeProposal ? "Change Proposal" : "Solution Element"} for Review\n"${title}"`);
            // TODO: write route, function and implement
            addToast(`Successfully initialized review phase for ${isChangeProposal ? "change proposal" : "element"} draft "${title}". Review invitations have been successfully sent out.`, 4000);
            navigate("/solutions");
        } catch (err) {
            console.error("Error submitting element:", err);
            addToast(`Error: ${err.message || "An unexpected error occurred while submitting the element. Please refresh the page and try again."}`, 6000);
        } finally {
            hideLoading();
        }
    }, [showLoading, hideLoading, title, addToast, navigate, isChangeProposal]);

    const handleSubmitElementDraft = useCallback(() => {
        if (!isElementDraft) return;
        const submitDraftMessage = `You’re submitting the ${isChangeProposal ? "change proposal" : "element"} draft "${title}" for review. A group of randomly selected users will provide feedback. Ensure you're available for questions, discussions, and potential revisions during this review phase.\n\nBefore submitting, please confirm to the best of your knowledge and perspective:\n\n    - You have thoroughly considered the ${isChangeProposal ? "changed" : "new"} element's role and its specific function within\n       the overall solution.\n    - You have evaluated how this ${isChangeProposal ? "changed " : ""}element interacts and integrates with other elements\n       in the solution.\n    - You have considered the potential benefits and drawbacks of ${isChangeProposal ? "these changes" : "this element"} on both\n       the solution and its individual components.\n    - You’ve assessed the potential consequences of this ${isChangeProposal ? "change proposal's" : "element's"} inclusion, including\n       any broader impacts it may have on the solution’s effectiveness.\n\nSubmitting incomplete or underdeveloped ${isChangeProposal ? "change proposals" : "elements"} may waste community resources.\n\nDo you want to continue?`;

        showConfirmationModal({
            title: `Submit ${isChangeProposal ? "Change Proposal" : "Element"} Draft for Review?`,
            message: submitDraftMessage,
            onConfirm: submitElementDraft,
            buttonMode: "submit_for_review",
            size: 700,
            followUp: true
        });
    },[isElementDraft, title, showConfirmationModal, submitElementDraft, isChangeProposal]);

    const publishElement = useCallback(async () => {
        try {
            showLoading(`Publishing ${isChangeProposal ? "Change Proposal" : "Solution Element"}\n"${title}"`);
            // TODO: write route, function and implement
            addToast(`Successfully published the ${isChangeProposal ? "change proposal" : "element"} titled "${title}".`, 4000);
            navigate("/solutions");
        } catch (err) {
            console.error("Error publishing element:", err);
            addToast(`Error: ${err.message || "An unexpected error occurred while publishing the element. Please refresh the page and try again."}`, 6000);
        } finally {
            hideLoading();
        }
    }, [showLoading, hideLoading, title, addToast, navigate, isChangeProposal]);

    const handlePublishElement = useCallback(() => {
        if (!isElementDraft) return;
        const publishElementMessage = `WARNING!\n\n\nYou are about to publish the ${isChangeProposal ? "change proposal" : "element"} titled "${title}" to the entire community.\n\nPlease ensure that:\n\n    - All feedback from reviewers has been addressed.\n    - Any significant concerns have been considered and, if necessary, incorporated.\n    - You are confident that the ${isChangeProposal ? "change proposal" : "element"} is fully developed and ready for community evaluation.\n\nPublishing ${isChangeProposal ? "change proposals" : "elements"} with unresolved issues or incomplete feedback can lead to rejection and waste community resources. Make sure you’ve thought this through carefully.\n\nDo you want to proceed?`;
        showConfirmationModal({
            title: `Publish ${isChangeProposal ? "Change Proposal" : "Element"} Draft?`,
            message: publishElementMessage,
            onConfirm: publishElement,
            entityType: isChangeProposal ? "Change Proposal" : "Element",
            buttonMode: "publish",
            size: 600,
            followUp: true,
            followUpMessage: "Just another test of the follow up message!"
        });
    },[isElementDraft, title, showConfirmationModal, publishElement, isChangeProposal]);


    return {handleDiscardElementDraft, handleSubmitElementDraft, handlePublishElement};
};

export default useElementDraftOperations;