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
            setIsSolutionDraft(solution.status === "draft" || solution.status === "under_review");
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
        if (isSolutionDraft) document.body.style.backgroundColor = "rgba(183,198,215,0.71)";

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

    const finalWarning = "WARNING\n\nThis cannot be undone.\nAre you sure you still want to continue?";
    const confirmAction = (message) => window.confirm(message) && window.confirm(finalWarning);

    const handleDiscardDraft = () => {
        const discardDraftMessage = `WARNING!\n\n\nYou are about to permanently delete the solution draft titled "${solution.title}", along with all associated elements.${solution.status === "under_review" ? "\n\nThis draft is currently under review. If you haven't already, you may want to discuss this step with the assigned reviewers before proceeding." : ""}\n\nStill continue?`;
        if (!isSolutionDraft || !confirmAction(discardDraftMessage)) {
            return;
        }
        console.log("Discard Draft");
    };

    const handleSubmitDraft = () => {
        const submitDraftMessage = `WARNING!\n\n\nYou are about to submit your solution draft titled "${solution.title}" for review. A group of randomly selected users will provide feedback. Ensure you're available for questions, discussions and potential revisions during this review phase.\n\nBefore submitting, ensure that to the best of your knowledge and perspective:\n\n    - You have thoroughly considered the solution and its elements.\n    - You’ve evaluated the potential consequences and overall impact.\n\nSubmitting incomplete or underdeveloped solutions may waste community resources.\n\nDo you want to continue?`;
        if (!isSolutionDraft || !confirmAction(submitDraftMessage)) {
            return;
        }
        console.log("Submit Draft");
    };

    const handlePublishSolution = () => {
        const publishSolutionMessage = `WARNING!\n\n\nYou are about to publish the solution titled "${solution.title}" to the entire community.\n\nPlease ensure that:\n\n    - All feedback from reviewers has been addressed.\n    - Any significant concerns have been considered and, if necessary, incorporated.\n    - You are confident that the solution is fully developed and ready for community evaluation.\n\nPublishing solutions with unresolved issues or incomplete feedback can lead to rejection and waste community resources. Make sure you’ve thought this through carefully.\n\nDo you want to proceed?`;
        if (!isSolutionDraft || !confirmAction(publishSolutionMessage)) {
            return;
        }
        console.log("Publish Solution");
    }


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
                    onPublishSolution={handlePublishSolution}
                    solutionStatus={solution.status}
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