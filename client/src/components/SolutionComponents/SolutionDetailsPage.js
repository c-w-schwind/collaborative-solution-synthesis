import "./SolutionDetailsPage.css";
import {Outlet, useLocation, useNavigate, useParams} from "react-router-dom";
import {useCallback, useEffect, useState} from "react";
import SolutionOverviewSection from "./SolutionOverviewSection";
import SolutionElementList from "../SolutionElementComponents/SolutionElementList";
import ConsiderationList from "../ConsiderationComponents/ConsiderationList";
import LoadingRetryOverlay from "../CommonComponents/LoadingRetryOverlay";
import {useGlobal} from "../../context/GlobalContext";
import SolutionDraftFooter from "./SolutionDraftFooter";
import {getScrollbarWidth} from "../../utils/utils";
import {useToasts} from "../../context/ToastContext";


function SolutionDetailsPage({onToggleDiscussionSpace, isDiscussionSpaceOpen, setEntityTitle, solutionDetailsContainerRef}) {
    const [solution, setSolution] = useState(null);
    const [renderElementOutlet, setRenderElementOutlet] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");
    const [deletionError, setDeletionError] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [isFooterDisabled, setIsFooterDisabled] = useState(false);

    const {isSolutionDraft, setIsSolutionDraft, wasElementListEdited, setWasElementListEdited} = useGlobal();
    const {addToast} = useToasts();
    const location = useLocation();
    const navigate = useNavigate();
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
        const isElementPath = location.pathname.split("/").includes("element");
        let timeoutId;

        if (isElementPath) {
            // Matching page-footer.hidden transition time
            timeoutId = setTimeout(() => setIsFooterDisabled(true), 300);
        } else {
            setIsFooterDisabled(isDeleting);
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [location.pathname, isDeleting]);

    useEffect(() => {
        if (isSolutionDraft) document.body.style.backgroundColor = "rgba(183,198,215,0.71)";

        return () => {
            document.body.style.backgroundColor = "";
        }
    }, [isSolutionDraft]);

    useEffect(() => {
        if (wasElementListEdited) {
            fetchSolution();
            setWasElementListEdited(false);
        }
    }, [wasElementListEdited, setWasElementListEdited, fetchSolution]);

    useEffect(() => {
        if (deletionError) {
            addToast("Error: " + deletionError, 6000);
        }
    }, [addToast, deletionError]);


    const handleRetry = () => {
        setRetryCount(1);
        setErrorMessage("");
    };

    const finalWarning = "WARNING\n\nThis cannot be undone.\nAre you sure you still want to continue?";
    const confirmAction = (message) => window.confirm(message) && window.confirm(finalWarning);

    const handleDiscardDraft = async () => {
        const discardDraftMessage = `WARNING!\n\nYou are about to permanently delete the solution draft titled "${solution.title}", along with all associated elements.${solution.status === "under_review" ? "\n\nThis draft is currently under review. If you haven't already, you may want to discuss this step with the assigned reviewers before proceeding." : ""}\n\nStill continue?`;
        if (!isSolutionDraft || !confirmAction(discardDraftMessage)) {
            return;
        }

        setIsDeleting(true);
        setDeletionError("");

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Unauthorized: No token found. Please log in.");

            const response = await fetch(`${process.env.REACT_APP_API_URL}/solutions/${solutionNumber}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("Solution not found. It may have already been deleted.");
                } else if (response.status === 401 || response.status === 403) {
                    throw new Error("You are not authorized to delete this solution.");
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Failed to delete solution. Status: ${response.status}`);
                }
            }

            addToast(`Successfully deleted the solution draft "${solution.title}".`, 4000);
            navigate("/solutions");
        } catch (err) {
            console.error("Error deleting solution:", err);
            setDeletionError(err.message || "An unexpected error occurred while deleting the solution.");
        } finally {
            setIsDeleting(false);
        }
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
                    isFooterDisabled={isFooterDisabled}
                    isDeleting={isDeleting}
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