import "./SolutionCard.css";
import {useFormData} from "../../context/FormDataContext";
import {useNavigate} from "react-router-dom";
import {formatToGermanTimezone} from "../../utils/utils";


function SolutionCard({solution}) {
    const {canNavigate} = useFormData();
    const navigate = useNavigate();
    const isDraft = solution.status === "draft";

    const handleDetailsClick = () => {
        if (canNavigate({checkSolutionForm: true})) navigate(`/solutions/${solution.solutionNumber}`);
    }

    return (
        <article className={`solution-card ${isDraft && "draft"}`}>
            <header className="solution-card-header">
                <div className="solution-title">{(isDraft ? "[UNPUBLISHED DRAFT]\n\n" : "") + solution.title}</div>
                <div className="header-right">
                    <div className="solution-timestamp">Last Updated: {formatToGermanTimezone(solution.updatedAt)}</div>
                    <div className="active-components">
                        <div>Solution Elements: {solution.activeSolutionElementsCount}</div>
                        <div>Considerations: {solution.activeConsiderationsCount}</div>
                    </div>
                </div>
            </header>
            <section className="solution-body">
                <div className="solution-content">{solution.overview}</div>
                <div className="solution-interactions">
                    <button className="details-button" style={isDraft ? {backgroundColor: "green"} : {}} onClick={handleDetailsClick}>{isDraft ? "Continue" : "Details"}</button>
                </div>
            </section>
        </article>
    );
}

export default SolutionCard;