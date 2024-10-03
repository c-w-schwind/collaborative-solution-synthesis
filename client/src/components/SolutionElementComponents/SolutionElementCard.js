import {useNavigate} from "react-router-dom";
import {useFormData} from "../../context/FormDataContext";
import {useCallback} from "react";
import {useGlobal} from "../../context/GlobalContext";


const SolutionElementCard = ({element, onToggleDiscussionSpace, isDiscussionSpaceOpen, isChangeProposal = false}) => {
    const isDraft = element.status === "draft";
    const isElementProposal = ((element.status === "proposal") && (!element.changeProposalFor));

    const navigate = useNavigate();
    const {canNavigate} = useFormData();
    const {isSolutionDraft} = useGlobal();

    const navigateToElement = useCallback(() => {
        navigate(`./element/${element.elementNumber}`, {state: {fromElementCard: true}});
    }, [navigate, element.elementNumber]);

    const handleTransitionEnd = useCallback((event) => {
        if (event.propertyName === 'opacity') {
            const discussionSpaceContainer = document.querySelector('.discussion-space-container');
            if (discussionSpaceContainer) {
                discussionSpaceContainer.removeEventListener('transitionend', handleTransitionEnd);
            }
            setTimeout(navigateToElement, 5);
        }
    }, [navigateToElement]);

    const handleClick = useCallback(() => {
        if (canNavigate({checkConsiderationForm: true, checkCommentForm: true, checkDiscussionSpaceForm: true, checkSolutionDraftTitleForm: true, checkSolutionDraftOverviewForm: true, checkSolutionDraftDescriptionForm: true, saveElementFormData: true})) {
            if (!isDiscussionSpaceOpen) {
                navigateToElement();
            } else {
                onToggleDiscussionSpace(false);
                const discussionSpaceContainer = document.querySelector('.discussion-space-container');
                if (discussionSpaceContainer) {
                    discussionSpaceContainer.addEventListener('transitionend', handleTransitionEnd);
                }
            }
        }
    }, [canNavigate, isDiscussionSpaceOpen, navigateToElement, onToggleDiscussionSpace, handleTransitionEnd]);

    return (
        <div className={`solution-element-card ${isDraft ? (isSolutionDraft ? "element-proposal" : "draft") : isElementProposal ? "element-proposal" : isChangeProposal ? "change-proposal" : ""}`} onClick={handleClick} style={{cursor: "pointer"}}>
            {isChangeProposal && <h4 style={{fontStyle: "italic", fontWeight: "unset", margin: "0 0 10px 0"}}>--- CHANGE PROPOSAL ---</h4>}
            {isElementProposal && <h4 style={{fontStyle: "italic", fontWeight: "unset", margin: "0 0 10px 0"}}>--- NEW ELEMENT PROPOSAL ---</h4>}
            <h4>{element.title} ({element.elementType})</h4>
            <p>{element.overview}</p>
        </div>
    );
};

export default SolutionElementCard;