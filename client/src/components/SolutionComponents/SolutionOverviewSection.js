import './SolutionOverviewSection.css'
import {useState} from "react";
import useOutsideClick from "../../context/useOutsideClickHook";


const SolutionOverviewSection = ({solution, onToggleDiscussionSpace}) => {
    const [showMeta, setShowMeta] = useState(false);
    const metaRef = useOutsideClick(() => setShowMeta(false));

    const handleMetaButtonClick = () => {
        setShowMeta(prevShowMeta => !prevShowMeta);
    };

    if (!solution) return <p>Loading solution details...</p>;

    return (
        <section className="solution-overview-section">
            <div className="solution-header">
                <h2 className="solution-title">{solution.title}</h2>
                <button onClick={onToggleDiscussionSpace}>Discussion Space</button>
                <div ref={metaRef} className="meta-button-container">
                    <button className={`solution-meta-button ${showMeta ? 'active' : ''}`} onClick={handleMetaButtonClick}>i</button>
                    {showMeta && (
                        <div className="solution-overview-meta">
                            <span className="proposed-by">Proposed by: {solution.proposedBy.username}</span>
                            <span className="created-at">Created at: {new Date(solution.createdAt).toLocaleDateString()}</span>
                            <span className="updated-at">Last Updated: {new Date(solution.updatedAt).toLocaleDateString()}</span>
                        </div>
                    )}
                </div>
            </div>
            <div className="solution-overview-and-details-container">
                <h3 className="solution-details-list-container-title">Overview</h3>
                <p className="solution-overview-section-text">{solution.overview}</p>
                <h3 className="solution-details-list-container-title">Detailed Description</h3>
                <p className="solution-overview-section-text">{solution.description}</p>
            </div>
        </section>
    );
};

export default SolutionOverviewSection;