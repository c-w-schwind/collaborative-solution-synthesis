import "./SolutionListPage.css";
import {useCallback, useEffect, useState} from "react";
import SolutionCard from "./SolutionCard";
import SolutionInput from "./SolutionInput";
import LoadingRetryOverlay from "../CommonComponents/LoadingRetryOverlay";

function SolutionListPage() {
    const [solutions, setSolutions] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");


    const fetchSolutions = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(`${process.env.REACT_APP_API_URL}/solutions`, {
                headers: token
                    ? {"Authorization": `Bearer ${token}`, "Content-Type": "application/json"}
                    : {}
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const solutions = await response.json();
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
                        <SolutionCard
                            key={solution._id}
                            solution={solution}
                        />
                    ))}
                </div>
            )}
            <SolutionInput/>
        </div>
    );
}

export default SolutionListPage;