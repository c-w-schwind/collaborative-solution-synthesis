import './SolutionListPage.css';
import {useCallback, useEffect, useState} from "react";
import SolutionCard from "../components/SolutionComponents/SolutionCard";
import {formatToGermanTimezone} from "../utils/dateUtils";

function SolutionListPage () {
    const [solutions, setSolutions] = useState([]);

    useEffect(() => {
        fetchSolutions();
        const interval = setInterval(() => {
            fetchSolutions();
        }, 120000); // Polling every 2 minutes

        return () => clearInterval(interval); // Cleanup on component unmount
    }, []);

    const fetchSolutions = useCallback(async () => {
        try{
            const response = await fetch(`${process.env.REACT_APP_API_URL}/solutions`);
            if (!response.ok){
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setSolutions(data.solutions);
        } catch (err) {
            console.error('Failed to fetch solutions:', err);
        }
    }, []);

    return (
        <>
            {solutions.length === 0 ? (
                <>
                    <div className="no-solutions-message">
                        Currently, there are no solutions available. This is your opportunity to lead the way!
                    </div>
                </>
            ) : (
                <div className="solutionsBlock">
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
            <div className="action-button-container">
                <div className="no-solutions-call-to-action">
                    Share your own solution and collaborate with the community<br/> to refine and explore new possibilities.
                </div>
                <button className="action-button">Add new Solution!</button>
            </div>
        </>
    )
}

export default SolutionListPage;