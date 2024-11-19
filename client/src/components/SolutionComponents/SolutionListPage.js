import "./SolutionListPage.css";
import {useCallback, useEffect, useState} from "react";
import SolutionCard from "../Cards/SolutionCard";
import SolutionInput from "./SolutionInput";
import LoadingRetryOverlay from "../CommonComponents/LoadingRetryOverlay";
import {handleRequest} from "../../services/solutionApiService";

function SolutionListPage() {
    const [solutions, setSolutions] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");


    const fetchSolutions = useCallback(async () => {
        try {
            const solutions = await handleRequest("GET", "solution");
            setSolutions(solutions);
            setRetryCount(0);
            setErrorMessage("");
        } catch (err) {
            console.error("Failed to fetch solutions:", err);
            setErrorMessage(err.message);
            setTimeout(() => {
                if (retryCount < 4) {
                    setRetryCount(prev => prev + 1);
                }
            }, 5000);
        }
    }, [retryCount]);


    useEffect(() => {
        fetchSolutions();
        const interval = setInterval(fetchSolutions, 120000); // Polling every 2 minutes

        return () => clearInterval(interval);
    }, [fetchSolutions]);


    const handleRetry = () => {
        setRetryCount(1);
        setErrorMessage("");
    };


    if (solutions == null || errorMessage) {
        return (
            <LoadingRetryOverlay
                componentName={"Solution List"}
                retryCount={retryCount}
                onHandleRetry={handleRetry}
                errorMessage={errorMessage}
            />
        );
    }

    return (
        <div className="solution-list-page">
            {solutions.length === 0 ? (
                <div className="no-solutions-message">
                    Currently, there are no solutions available. This is your opportunity to lead the way!
                </div>
            ) : (
                <div className="solution-list">
                    {solutions.map(solution => (
                        <div key={solution._id}>
                            <SolutionCard
                                solution={solution}
                            />
                            {solution.changeProposals && solution.changeProposals.length > 0 && (
                                <div>
                                    {solution.changeProposals.map(cp => (
                                        <SolutionCard
                                            key={cp._id}
                                            solution={cp}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
            <SolutionInput/>
        </div>
    );
}

export default SolutionListPage;