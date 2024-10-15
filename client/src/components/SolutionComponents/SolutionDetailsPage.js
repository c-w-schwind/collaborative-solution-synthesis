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
import {useConfirmationModal} from "../../context/ConfirmationModalContext";
import {useLoading} from "../../context/LoadingContext";


function SolutionDetailsPage({onToggleDiscussionSpace, isDiscussionSpaceOpen, setEntityTitle, solutionDetailsContainerRef}) {
    const [solution, setSolution] = useState(null);
    const [renderElementOutlet, setRenderElementOutlet] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");
    const [isFooterDisabled, setIsFooterDisabled] = useState(false);

    const {isSolutionDraft, setIsSolutionDraft, wasElementListEdited, setWasElementListEdited} = useGlobal();
    const {showLoading, hideLoading} = useLoading();
    const {showConfirmationModal} = useConfirmationModal();
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
            setIsFooterDisabled(false);
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [location.pathname]);

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


    const deleteSolutionDraft = useCallback(async () => {
        try {
            showLoading();
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
            addToast(`Error: ${err.message || "An unexpected error occurred while deleting the solution."}`, 6000);
        } finally {
            hideLoading();
        }
    }, [showLoading, hideLoading, solutionNumber, addToast, navigate, solution]);


    const handleDiscardDraft = useCallback(() => {
        if (!isSolutionDraft) return;
        const discardDraftMessage = `You are about to permanently delete the solution draft titled "${solution.title}", along with all associated elements.${solution.status === "under_review" ? "\n\nThis draft is currently under review. If you haven't already, you may want to discuss this step with the assigned reviewers before proceeding." : ""}`;

        showConfirmationModal({
            title: "Delete Solution Draft?",
            message: discardDraftMessage,
            onConfirm: () => showConfirmationModal({
                title: "WARNING",
                message: "This action cannot be undone.\n\nStill continue?",
                onConfirm: deleteSolutionDraft,
                mode: "delete"
            }),
            mode: "delete",
            followUp: true
        });
    }, [isSolutionDraft, showConfirmationModal, solution, deleteSolutionDraft]);

    const handleSubmitDraft = useCallback(() => {
        if (!isSolutionDraft) return;
        const submitDraftMessage = `You are about to submit your solution draft titled "${solution.title}" for review. A group of randomly selected users will provide feedback. Ensure you're available for questions, discussions and potential revisions during this review phase.\n\nBefore submitting, ensure that to the best of your knowledge and perspective:\n\n    - You have thoroughly considered the solution and its elements.\n    - You’ve evaluated the potential consequences and overall impact.\n\nSubmitting incomplete or underdeveloped solutions may waste community resources.\n\nDo you want to continue?`;
        showConfirmationModal({
            title: "Submit Solution Draft for Review?",
            message: submitDraftMessage,
            onConfirm: () => showConfirmationModal({
                title: "WARNING",
                message: "This action cannot be undone.\n\nStill continue?",
                onConfirm: () => console.log("Submit Draft"),    // TODO: write route, function and implement
                mode: "initiate review"
            }),
            mode: "submit for review",
            followUp: true,
            size: "600"
        });
    },[isSolutionDraft, showConfirmationModal, solution]);

    const handlePublishSolution = useCallback(() => {
        if (!isSolutionDraft) return;
        const publishSolutionMessage = `WARNING!\n\n\nYou are about to publish the solution titled "${solution.title}" to the entire community.\n\nPlease ensure that:\n\n    - All feedback from reviewers has been addressed.\n    - Any significant concerns have been considered and, if necessary, incorporated.\n    - You are confident that the solution is fully developed and ready for community evaluation.\n\nPublishing solutions with unresolved issues or incomplete feedback can lead to rejection and waste community resources. Make sure you’ve thought this through carefully.\n\nDo you want to proceed?`;
        showConfirmationModal({
            title: "Publish Solution Draft?",
            message: publishSolutionMessage,
            onConfirm: () => showConfirmationModal({
                title: "WARNING",
                message: "This action cannot be undone.\n\nStill continue?",
                onConfirm: () => console.log("Publish Solution"),    // TODO: write route, function and implement
                mode: "publish"
            }),
            mode: "publish",
            followUp: true
        });
    },[isSolutionDraft, showConfirmationModal, solution]);

    const handleRetry = useCallback(() => {
        setRetryCount(1);
        setErrorMessage("");
    },[]);


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