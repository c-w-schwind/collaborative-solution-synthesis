import {useNavigate} from "react-router-dom";
import {useFormData} from "../../context/FormDataContext";
import {useCallback} from "react";
import {useGlobal} from "../../context/GlobalContext";


const SolutionElementCard = ({element, onToggleDiscussionSpace, isDiscussionSpaceOpen, isChangeProposal = false}) => {
    const isDraft = element.status === "draft";
    const isActiveProposal = ((element.status === "proposal") && (!element.changeProposalFor));
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

    const handleClick = useCallback(() => {
        if (canNavigate({
            checkConsiderationForm: true,
            checkCommentForm: true,
            checkDiscussionSpaceForm: true,
            checkSolutionDraftTitleForm: true,
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
            classes += isChangeProposal ? "change-proposal review" : "review";
        } else if (isActiveProposal) {
            classes += "new-element-proposal";
        } else if (isChangeProposal) {
            classes += "change-proposal";
        }

        return classes;
    };

    return (
        <div className={getCardClasses()} onClick={handleClick} style={{cursor: "pointer"}}>
            <div className="element-card-header">
                <h4>{element.title} ({element.elementType})</h4>
                {isDraft && !isSolutionDraft && <h4 className="additional-info">- Private Draft -</h4>}
                {isUnderReview && <h4 className="additional-info">- Under Review -</h4>}
                {isActiveProposal && <h4 className="additional-info">- New Element Proposal -</h4>}
                {isChangeProposal && <h4 className="additional-info">- Change Proposal -</h4>}
            </div>
            <p>{isChangeProposal ? element.changeSummary : element.overview}</p>
        </div>
    );
};

export default SolutionElementCard;