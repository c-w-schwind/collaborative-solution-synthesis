import "./SolutionCard.css";
import {useFormData} from "../../context/FormDataContext";
import {useNavigate} from "react-router-dom";
import {formatToGermanTimezone} from "../../utils/utils";


function SolutionCard({solution, isChangeProposal = false}) {
    const {canNavigate} = useFormData();
    const navigate = useNavigate();
    const isDraft = solution.status === "draft";
    const isUnderReview = solution.status === "under_review";

    const handleDetailsClick = () => {
        if (canNavigate({checkSolutionForm: true})) navigate(`/solutions/${solution.solutionNumber}`);
    }

    const getCardClasses = () => {
        let classes = "solution-card ";

        if (isDraft) {
            classes += "draft";
        } else if (isChangeProposal) {
            classes += !isUnderReview ? "change-proposal" : "change-proposal review";
        } else if (isUnderReview) {
            classes += "review";
        }

        return classes;
    };

    return (
        <article className={getCardClasses()}>
            <header className="solution-card-header">
                <div className="header-left">
                    {(isChangeProposal || isUnderReview || isDraft) && <div className="solution-card-type-info">{(isUnderReview ? "- Under Review -" : isChangeProposal ? "- Change Proposal -\n" : isDraft ? "- Private Draft -\n\n" : "")}</div>}
                    <div className="solution-title" style={(isChangeProposal || isUnderReview || isDraft) ? {marginBottom: 5} : {}}>{solution.title}</div>
                </div>
                <div className="header-right">
                    <div className="solution-timestamp">{isChangeProposal ?  "Proposed at: " : "Last Updated: "}{formatToGermanTimezone(solution.updatedAt)}</div>
                    <div className="active-components">
                        <div>Solution Elements: {solution.activeSolutionElementsCount}</div>
                        <div>Considerations: {solution.activeConsiderationsCount}</div>
                    </div>
                </div>
            </header>
            <section className="solution-body">
                <div className="solution-content">{!isChangeProposal ? solution.overview : solution.changeSummary}</div>
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
        </article>
    );
}

export default SolutionCard;