import React, {useCallback, useEffect} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {useGlobal} from "../../context/GlobalContext";
import {useFormData} from "../../context/FormDataContext";
import {useConfirmationModal} from "../../context/ConfirmationModalContext";


const SolutionElementCard = ({element, entityType, onToggleDiscussionSpace, onToggleComparison, currentSidePanelType}) => {
    const isDraft = element.status === "draft";
    const isChangeProposal = Boolean(element.changeProposalFor) && ["draft", "under_review", "proposal"].includes(element.status);
    const isUnderReview = element.status === "under_review";

    const navigate = useNavigate();
    const {canNavigate} = useFormData();
    const {isSolutionDraft, isSolutionCP} = useGlobal();
    const {comparisonEntityNumber} = useParams();
    const {showConfirmationModal} = useConfirmationModal();

    const navigateToElement = useCallback(() => {
        if (entityType === "ComparisonSolution") {
            showConfirmationModal({
                title: "Navigate to Original Solution?",
                message: `\nYou are about to leave the current Change Proposal view and navigate to the original Solution to view the Element${isChangeProposal ? " Change Proposal" : ""} "${element.title}".\n\nDo you wish to proceed?`,
                onConfirm: () => window.location.href = `/solutions/${comparisonEntityNumber}/element/${element.elementNumber}${element.status === "accepted" ? "" : `/${element.versionNumber}`}`
            });
        } else {
            navigate(`./element/${element.elementNumber}${element.status === "accepted" ? "" : `/${element.versionNumber}`}`, {state: {fromElementCard: true}});
        }
    }, [entityType, showConfirmationModal, isChangeProposal, element.title, element.status, comparisonEntityNumber, navigate, element.elementNumber, element.versionNumber]);

    const handleTransitionEnd = useCallback((event) => {
        if (event.propertyName === "opacity") {
            const discussionSpaceContainer = document.querySelector(".side-panel-container");
            if (discussionSpaceContainer) {
                discussionSpaceContainer.removeEventListener("transitionend", handleTransitionEnd);
            }
            setTimeout(navigateToElement, 5);
        }
    }, [navigateToElement]);

    useEffect(() => {
        return () => {
            const discussionSpaceContainer = document.querySelector(".side-panel-container");
            if (discussionSpaceContainer) {
                discussionSpaceContainer.removeEventListener("transitionend", handleTransitionEnd);
            }
        };
    }, [handleTransitionEnd]);

    const handleClick = useCallback(() => {
        if (canNavigate({
            checkConsiderationForm: true,
            checkCommentForm: true,
            checkDiscussionSpaceForm: true,
            checkSolutionDraftTitleForm: true,
            checkSolutionDraftChangeSummaryForm: true,
            checkSolutionDraftOverviewForm: true,
            checkSolutionDraftDescriptionForm: true,
            saveElementFormData: true
        })) {
            if (!currentSidePanelType || entityType === "ComparisonSolution") {
                navigateToElement();
            } else {
                currentSidePanelType === "DiscussionSpace" ? onToggleDiscussionSpace(false) : onToggleComparison();
                const discussionSpaceContainer = document.querySelector(".side-panel-container");
                if (discussionSpaceContainer) {
                    discussionSpaceContainer.addEventListener("transitionend", handleTransitionEnd);
                }
            }
        }
    }, [canNavigate, currentSidePanelType, entityType, navigateToElement, onToggleDiscussionSpace, onToggleComparison, handleTransitionEnd]);


    const getCardClasses = () => {
        let classes = "card solution-element-card ";

        if (isDraft) {
            classes += isSolutionDraft && !isSolutionCP && (entityType !== "ComparisonSolution") ? "new-element-proposal" : "draft";
        } else if (isUnderReview) {
            classes += (isSolutionDraft && !isSolutionCP && entityType !== "ComparisonSolution") ? "new-element-proposal" : isChangeProposal ? "change-proposal review change-proposal-review" : "review";
        } else if (isChangeProposal) {
            classes += "change-proposal";
        } else if (element.status === "proposal") {
            classes += "new-element-proposal";
        }

        /*if (unreadContentInside) {
            classes += " with-shimmer-border";
        }*/

        return classes;
    };

    const getTypeInfo = () => {
        if ((isSolutionDraft && !isSolutionCP && (entityType !== "ComparisonSolution")) || !["draft", "under_review", "proposal"].includes(element.status)) {
            return null;
        }

        const cardType = isChangeProposal ? "Change Proposal" : "Element Proposal";
        let statusInfo = isDraft ? " - Private Draft" : isUnderReview ? " - Under Review" : "";

        return (<h4 className="solution-element-card-type-info">{cardType + statusInfo}</h4>);
    };


    return (
        <div className={getCardClasses()} onClick={handleClick} style={{cursor: "pointer"}}>
            <div className={`content ${isChangeProposal && !isDraft ? "change-proposal" : ""} ${isUnderReview && !isSolutionDraft ? "review" : ""}`}>
                <div className="element-card-header">
                    <h4>{element.title} ({element.elementType})</h4>
                    {getTypeInfo()}
                </div>
                <p>{isChangeProposal ? element.changeSummary : element.overview}</p>
            </div>
        </div>
    );
};

export default React.memo(SolutionElementCard);