import React from 'react';
import './SolutionOverviewSection.css'

const SolutionOverviewSection = ({ solution }) => {
    if (!solution) return <p>Loading solution details...</p>;

    return (
        <section className="solution-overview-section">
            <h2 className="solution-title">{solution.title}</h2>
            <p className="solution-overview">{solution.overview}</p>
            <p className="solution-description">{solution.description}</p>
            <div className="solution-overview-meta">
                <span className="proposed-by">Proposed by: {solution.proposedBy.username}</span>
                <span className="created-at">Created at: {new Date(solution.createdAt).toLocaleDateString()}</span>
                <span className="updated-at">Last Updated: {new Date(solution.updatedAt).toLocaleDateString()}</span>
            </div>
        </section>
    );
};

export default SolutionOverviewSection;