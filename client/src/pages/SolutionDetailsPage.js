import './SolutionDetailsPage.css';
import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import SolutionOverviewSection from "../components/SolutionComponents/SolutionOverviewSection";
import SolutionElementsList from "../components/SolutionComponents/SolutionElementList";


function SolutionDetailsPage() {
    const {solutionNumber} = useParams();
    const [solution, setSolution] = useState(null);

    useEffect( () => {
        const fetchSolution = async () => {
            try{
                const response = await fetch(`http://localhost:5555/solutions/${solutionNumber}`)
                if (!response.ok){
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                setSolution(data.solution);
            } catch (err) {
                console.error('Failed to fetch solution:', err);
            }
        }

        fetchSolution();
    }, [solutionNumber]);


    return (
        solution ? (
            <>
                <div className="solution-details-container">
                    <SolutionOverviewSection solution={solution}/>
                    <SolutionElementsList elements={solution.solutionElements}/>
                </div>
            </>
        ) : (
            <p>Loading solution details...</p>
        )
    );
}

export default SolutionDetailsPage;