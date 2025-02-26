import "./ExplanationCard.css";

// Note: This temporary static display component renders explanatory content as a styled card for unfinished sections.
const ExplanationCard = ({content}) => {
    return (
        <article className="card solution-card" style={{marginTop: "40px"}}>
            <div className="explanation-body">
                <div className="explanation-content" dangerouslySetInnerHTML={{__html: content}}/>
            </div>
        </article>
    );
};

export default ExplanationCard;