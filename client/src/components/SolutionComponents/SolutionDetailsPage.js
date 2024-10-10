import "./SolutionDetailsPage.css";
import {Outlet, useLocation, useParams} from "react-router-dom";
import {useCallback, useEffect, useState} from "react";
import SolutionOverviewSection from "./SolutionOverviewSection";
import SolutionElementList from "../SolutionElementComponents/SolutionElementList";
import ConsiderationList from "../ConsiderationComponents/ConsiderationList";
import LoadingRetryOverlay from "../CommonComponents/LoadingRetryOverlay";
import {useGlobal} from "../../context/GlobalContext";
import SolutionDraftFooter from "./SolutionDraftFooter";
import {getScrollbarWidth} from "../../utils/utils";


function SolutionDetailsPage({onToggleDiscussionSpace, isDiscussionSpaceOpen, setEntityTitle, solutionDetailsContainerRef}) {
    const [solution, setSolution] = useState(null);
    const [renderElementOutlet, setRenderElementOutlet] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");

    const {isSolutionDraft, setIsSolutionDraft, wasElementListEdited, setWasElementListEdited} = useGlobal();
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

            const solution = await response.json();
            setSolution(solution);
            setIsSolutionDraft(solution.status === "draft");
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
        if (isSolutionDraft) document.body.style.backgroundColor = "rgba(183,198,215,0.71)";    //rgba(162,117,117,0.47)

        return () => document.body.style.backgroundColor = "";
    }, [isSolutionDraft]);

    useEffect(() => {
        if (wasElementListEdited) {
            fetchSolution();
            setWasElementListEdited(false);
        }
    }, [wasElementListEdited, setWasElementListEdited, fetchSolution]);


    const handleRetry = () => {
        setRetryCount(1);
        setErrorMessage("");
    };

    const handleDiscardDraft = () => {
        // Implement the discard draft functionality
        console.log("Discard Draft");
    };

    const handleSubmitDraft = () => {
        // Implement the submit draft functionality
        console.log("Submit Draft");
    };


    return (
        solution ? (
            <>
                <div className={`solution-details-area ${isDiscussionSpaceOpen ? "solution-details-area-ds-open" : ""}`}>
                    <div ref={solutionDetailsContainerRef} className="solution-details-container" style={{width: `calc(50vw - ${getScrollbarWidth()}px)`}}>
                        <SolutionOverviewSection
                            solution={solution}
                            setSolution={setSolution}
                            onToggleDiscussionSpace={onToggleDiscussionSpace}
                        />
                        <SolutionElementList
                            elements={solution.solutionElements}
                            elementDrafts={solution.elementDrafts}
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

                {isSolutionDraft && <SolutionDraftFooter
                    onDiscardDraft={handleDiscardDraft}
                    onSubmitDraft={handleSubmitDraft}
                />}
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