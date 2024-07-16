import "./SolutionDetailsPage.css";
import {Outlet, useLocation, useParams} from "react-router-dom";
import {useCallback, useEffect, useState} from "react";
import SolutionOverviewSection from "../components/SolutionComponents/SolutionOverviewSection";
import SolutionElementList from "../components/SolutionComponents/SolutionElementList";
import ConsiderationList from "../components/ConsiderationComponents/ConsiderationList";
import LoadingRetryOverlay from "../components/CommonComponents/LoadingRetryOverlay";
import {useGlobal} from "../context/GlobalContext";

function SolutionDetailsPage({onToggleDiscussionSpace, isDiscussionSpaceOpen, setEntityTitle, solutionContainerRef}) {
    const [solution, setSolution] = useState(null);
    const [renderElementOutlet, setRenderElementOutlet] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");

    const {isSolutionDraft, setIsSolutionDraft} = useGlobal();
    const location = useLocation();
    const {solutionNumber} = useParams();

    const fetchSolution = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(`${process.env.REACT_APP_API_URL}/solutions/${solutionNumber}`, {
                headers: token
                    ? {"Authorization": `Bearer ${token}`, "Content-Type": "application/json"}
                    : {}
            });

            if (!response.ok) {
                if (response.status === 401) {
                    const errorMessage = token
                        ? "This solution is private.\n\n\nYou don't have access to view it."
                        : "Unauthorized access.\n\n\nPlease log in to view this solution.";
                    throw new Error(errorMessage);
                }
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            setSolution(data.solution);
            setIsSolutionDraft(data.solution.status === "private");
            setRetryCount(0);
            setErrorMessage("");
        } catch (err) {
            console.error("Failed to fetch solution:", err);
            setErrorMessage(err.message);
            if (err.message.includes("Unauthorized")) {
                return; // Preventing retry
            }
            setTimeout(() => {
                if (retryCount < 4) {
                    setRetryCount(prev => prev + 1);
                }
            }, 5000);
        }
    }, [solutionNumber, retryCount, setIsSolutionDraft]);

    useEffect(() => {
        fetchSolution();
    }, [fetchSolution]);

    useEffect(() => {
        if (solution) setEntityTitle(solution.title);
    }, [solution, setEntityTitle]);

    useEffect(() => {
        const pathSegments = location.pathname.split("/");
        const isDiscussionPath = pathSegments.includes("discussionSpace");
        const isElementPath = pathSegments.includes("element");

        setRenderElementOutlet(!(isDiscussionPath && !isElementPath));
    }, [location.pathname]);

    useEffect(() => {
        if (isSolutionDraft) document.body.style.backgroundColor = "rgba(236,204,204,0.71)";

        return () => document.body.style.backgroundColor = "";
    }, [isSolutionDraft]);

    const handleRetry = () => {
        setRetryCount(1);
        setErrorMessage("");
    };

    return (
        solution ? (
            <>
                <div className={`solution-details-area ${isDiscussionSpaceOpen ? "solution-details-area-ds-open" : ""}`}>
                    <div ref={solutionContainerRef} className="solution-details-container">
                        <SolutionOverviewSection
                            solution={solution}
                            setSolution={setSolution}
                            onToggleDiscussionSpace={onToggleDiscussionSpace}
                        />
                        <SolutionElementList
                            elements={solution.solutionElements}
                            onToggleDiscussionSpace={onToggleDiscussionSpace}
                            isDiscussionSpaceOpen={isDiscussionSpaceOpen}
                            parentNumber={solutionNumber}
                        />
                        <ConsiderationList
                            considerations={solution.considerations}
                            onSuccessfulSubmit={fetchSolution}
                            parentType={"Solution"}
                            parentNumber={solutionNumber}
                        />
                    </div>
                </div>
                {renderElementOutlet && <Outlet/>}
            </>
        ) : (
            <LoadingRetryOverlay
                componentName={"Solution Details Page"}
                retryCount={retryCount}
                onHandleRetry={handleRetry}
                errorMessage={errorMessage}
            />
        )
    );
}

export default SolutionDetailsPage;