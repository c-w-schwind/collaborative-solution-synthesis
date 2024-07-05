import './SolutionListPage.css';
import {useEffect, useState} from "react";
import SolutionCard from "../components/SolutionComponents/SolutionCard";
import {formatToGermanTimezone} from "../utils/utils";
import SolutionInput from "../components/SolutionComponents/SolutionInput";

function SolutionListPage() {
    const [solutions, setSolutions] = useState([]);

    useEffect(() => {
        fetchSolutions();
        const interval = setInterval(fetchSolutions, 120000); // Polling every 2 minutes

        return () => clearInterval(interval);
    }, []);

    const fetchSolutions = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/solutions`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setSolutions(data.solutions);
        } catch (err) {
            console.error('Failed to fetch solutions:', err);
        }
    };

    return (
        <div className="solution-list-page">
            {solutions.length === 0 ? (
                <div className="no-solutions-message">
                    Currently, there are no solutions available. This is your opportunity to lead the way!
                </div>
            ) : (
                <div className="solution-list">
                    {solutions.map(solution => (
                        <SolutionCard
                            key={solution._id}
                            solutionNumber={solution.solutionNumber}
                            title={solution.title}
                            overview={solution.overview}
                            activeSolutionElementsCount={solution.activeSolutionElementsCount}
                            activeConsiderationsCount={solution.activeConsiderationsCount}
                            updatedAt={formatToGermanTimezone(solution.updatedAt)}
                        />
                    ))}
                </div>
            )}
            <SolutionInput/>
        </div>
    )
}

export default SolutionListPage;