import './SolutionsPage.css';
import {useCallback, useEffect, useState} from "react";
import SolutionCard from "../components/SolutionComponents/SolutionCard";
import {formatToGermanTimezone} from "../utils/dateUtils";

function SolutionsPage () {
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
            const response = await fetch(`http://localhost:5555/solutions`);
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
        <div className="solutionsBlock">
            {solutions.map(solution => (
                <SolutionCard
                    key={solution._id}
                    title={solution.title}
                    overview={solution.overview}
                    activeSolutionElementsCount={solution.activeSolutionElementsCount}
                    activeConsiderationsCount={solution.activeConsiderationsCount}
                    updatedAt={formatToGermanTimezone(solution.updatedAt)}
                />
            ))}
        </div>
    )
}

export default SolutionsPage;