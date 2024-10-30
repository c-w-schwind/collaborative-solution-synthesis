import {useNavigate} from "react-router-dom";
import {useFormData} from "../../context/FormDataContext";
import {useCallback, useEffect} from "react";
import {useGlobal} from "../../context/GlobalContext";


const SolutionElementCard = ({element, onToggleDiscussionSpace, isDiscussionSpaceOpen}) => {
    const isDraft = element.status === "draft";
    const isChangeProposal = Boolean(element.changeProposalFor) && ["draft", "under_review", "proposal"].includes(element.status);
    const isUnderReview = element.status === "under_review";

    const navigate = useNavigate();
    const {canNavigate} = useFormData();
    const {isSolutionDraft} = useGlobal();

    const navigateToElement = useCallback(() => {
        navigate(`./element/${element.elementNumber}`, {state: {fromElementCard: true}});
    }, [navigate, element.elementNumber]);

    const handleTransitionEnd = useCallback((event) => {
        if (event.propertyName === "opacity") {
            const discussionSpaceContainer = document.querySelector(".discussion-space-container");
            if (discussionSpaceContainer) {
                discussionSpaceContainer.removeEventListener("transitionend", handleTransitionEnd);
            }
            setTimeout(navigateToElement, 5);
        }
    }, [navigateToElement]);

    useEffect(() => {
        return () => {
            const discussionSpaceContainer = document.querySelector(".discussion-space-container");
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
            if (!isDiscussionSpaceOpen) {
                navigateToElement();
            } else {
                onToggleDiscussionSpace(false);
                const discussionSpaceContainer = document.querySelector(".discussion-space-container");
                if (discussionSpaceContainer) {
                    discussionSpaceContainer.addEventListener("transitionend", handleTransitionEnd);
                }
            }
        }
    }, [canNavigate, isDiscussionSpaceOpen, navigateToElement, onToggleDiscussionSpace, handleTransitionEnd]);

    const getCardClasses = () => {
        let classes = "solution-element-card ";

        if (isDraft) {
            classes += isSolutionDraft ? "new-element-proposal" : "draft";
        } else if (isUnderReview) {
            classes += isSolutionDraft ? "new-element-proposal" : isChangeProposal ? "change-proposal review change-proposal-review" : "review";
        } else if (isChangeProposal) {
            classes += "change-proposal";
        } else if (element.status === "proposal") {
            classes += "new-element-proposal";
        }

        return classes;
    };

    const getTypeInfo = () => {
        if (isSolutionDraft || !["draft", "under_review", "proposal"].includes(element.status)) {
            return null;
        }

        const cardType = isChangeProposal ? "Change Proposal" : "Element Proposal";
        let statusInfo = isDraft ? " - Private Draft" : isUnderReview ? " - Under Review" : "";

        return (<h4 className="solution-element-card-type-info">{cardType + statusInfo}</h4>)
    }

    return (
        <div className={getCardClasses()} onClick={handleClick} style={{cursor: "pointer"}}>
            <div className="element-card-header">
                <h4>{element.title} ({element.elementType})</h4>
                {getTypeInfo()}
            </div>
            <p>{isChangeProposal ? element.changeSummary : element.overview}</p>
        </div>
    );
};

export default SolutionElementCard;