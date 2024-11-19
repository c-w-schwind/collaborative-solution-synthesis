import "./SolutionCard.css";
import "./SolutionElementCard.css";
import "./Card.css";
import {useFormData} from "../../context/FormDataContext";
import {useNavigate} from "react-router-dom";
import {formatToGermanTimezone} from "../../utils/utils";


function SolutionCard({solution}) {
    const {canNavigate} = useFormData();
    const navigate = useNavigate();
    const isDraft = solution.status === "draft";
    const isUnderReview = solution.status === "under_review";
    const isChangeProposal = Boolean(solution.changeProposalFor) && ["draft", "under_review", "proposal"].includes(solution.status);

    const handleDetailsClick = () => {
        if (canNavigate({checkSolutionForm: true})) navigate(`/solutions/${solution.solutionNumber}`);
    };

    const getCardClasses = () => {
        let classes = "card solution-card ";

        if (isDraft) {
            classes += "draft";
        } else if (isUnderReview) {
            classes += isChangeProposal ? "change-proposal review review-change-proposal" : "review";
        } else if (isChangeProposal) {
            classes += "change-proposal";
        }

        /*if (unreadContentInside) {
            classes += " with-shimmer-border ";
        }*/

        return classes;
    };

    const getTypeInfo = () => {
        if (!(isChangeProposal || isUnderReview || isDraft)) {
            return null;
        }

        const cardType = isChangeProposal ? "Change Proposal" : "New Solution";
        let statusInfo = isUnderReview ? " - Under Review" : isDraft ? " - Private Draft" : "";

        return <div className="solution-card-type-info">{cardType + statusInfo}</div>
    };


    return (
        <article className={getCardClasses()}>
            <div className={`content ${isChangeProposal && !isDraft ? "change-proposal" : ""} ${isUnderReview ? "review" : ""}`}>
                <header className="solution-card-header">
                    <div className="header-left">
                        {getTypeInfo()}
                        <div className="solution-title">{solution.title}</div>
                    </div>
                    <div className="header-right">
                        <div className="solution-timestamp">
                            {isChangeProposal && solution.status === "proposal" ? "Proposed at: " : "Last Updated: "}{formatToGermanTimezone(solution.updatedAt)}
                        </div>
                        <div className="active-components">
                            <div>Solution Elements: {solution.activeSolutionElementsCount}</div>
                            <div>Considerations: {solution.activeConsiderationsCount}</div>
                        </div>
                    </div>
                </header>
                <section className="solution-body">
                    <div className="solution-content">{isChangeProposal ? solution.changeSummary : solution.overview}</div>
                    <div className="solution-interactions">
                        <button
                            className={!isDraft ? "details-button" : "draft-edit-button"}
                            style={!isDraft ? {} : {width: "100px"}}
                            onClick={handleDetailsClick}
                        >
                            {!isDraft ? "Details" : "Continue"}
                        </button>
                    </div>
                </section>
            </div>
        </article>
    );
}

export default SolutionCard;