import './SolutionCard.css';

function SolutionCard({ title, overview, activeSolutionElementsCount, activeConsiderationsCount, updatedAt }) {
    return (
        <article className="solution-card">
            <header className="solution-header">
                <div className="solution-title">{title}</div>
                <div className="header-right">
                    <div className="solution-timestamp">Last Updated: {updatedAt}</div>
                    <div className="active-components">
                        <div>Solution Elements: {activeSolutionElementsCount}</div>
                        <div>Considerations: {activeConsiderationsCount}</div>
                    </div>
                </div>
            </header>
            <section className="solution-body">
                <div className="solution-content">{overview}</div>
                <div className="solution-interactions">
                    <button className="details-button">Details</button>
                </div>
            </section>
        </article>
    );
}

export default SolutionCard;