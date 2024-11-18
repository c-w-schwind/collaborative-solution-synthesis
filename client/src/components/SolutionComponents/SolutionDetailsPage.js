import "./SolutionDetailsPage.css";
import {Outlet, useLocation, useOutletContext, useParams} from "react-router-dom";
import {useCallback, useEffect, useState} from "react";
import SolutionOverviewSection from "./SolutionOverviewSection";
import SolutionElementList from "../SolutionElementComponents/SolutionElementList";
import ConsiderationList from "../ConsiderationComponents/ConsiderationList";
import LoadingRetryOverlay from "../CommonComponents/LoadingRetryOverlay";
import SolutionDraftFooter from "./SolutionDraftFooter";
import {useGlobal} from "../../context/GlobalContext";
import {useAuth} from "../../context/AuthContext";
import {getScrollbarWidth} from "../../utils/utils";
import {handleRequest} from "../../services/solutionApiService";
import useDraftOperations from "../../hooks/useDraftOperations";


function SolutionDetailsPage(props) {
    // In case of change proposal comparison view props will be imported via useOutletContext instead of HOC passing them down
    const {onToggleDiscussionSpace, onToggleComparison, currentSidePanelType, setEntityTitle, solutionDetailsContainerRef, solutionDetailsAreaRef, entityType} = useOutletContext() || props;

    const [solution, setSolution] = useState(null);
    const [renderElementOutlet, setRenderElementOutlet] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");
    const [isFooterDisabled, setIsFooterDisabled] = useState(false);

    const {isSolutionDraft, setIsSolutionDraft, shouldRefetchSolution, clearSolutionRefetchFlag} = useGlobal();
    const location = useLocation();
    const {solutionNumber, comparisonEntityNumber} = useParams();
    const {handleDiscardDraft, handleSubmitDraft, handlePublishSolution} = useDraftOperations(
        {solutionNumber: solution?.solutionNumber, title: solution?.title, status: solution?.status},
        isSolutionDraft
    );
    const {user} = useAuth();
    const isUserAuthor = user?._id === solution?.proposedBy?._id;
    const isChangeProposal = Boolean(solution?.changeProposalFor) && ["draft", "under_review", "proposal"].includes(solution?.status);


    const fetchSolutionData = useCallback(async () => {
        try {
            const solutionData = await handleRequest("GET", "solution", entityType === "ComparisonSolution" ? comparisonEntityNumber : solutionNumber);
            setSolution(solutionData);
            if (entityType === "Solution") {
                setIsSolutionDraft(solutionData.status === "draft" || solutionData.status === "under_review");
            }
            setRetryCount(0);
            setErrorMessage("");
        } catch (err) {
            console.error("Failed to fetch solution:", err);
            setErrorMessage(err.message);
            if (!err.message.includes("Unauthorized")) {
                setTimeout(() => {
                    if (retryCount < 4) {
                        setRetryCount(prev => prev + 1);
                    }
                }, 5000);
            }
        }
    }, [entityType, comparisonEntityNumber, solutionNumber, retryCount, setIsSolutionDraft]);


    useEffect(() => {
        fetchSolutionData();
    }, [fetchSolutionData]);

    useEffect(() => {
        if (shouldRefetchSolution) {
            fetchSolutionData();
            clearSolutionRefetchFlag();
        }
    }, [shouldRefetchSolution, fetchSolutionData, clearSolutionRefetchFlag]);

    useEffect(() => {
        if (solution) setEntityTitle(solution.title);
    }, [solution, setEntityTitle]);

    useEffect(() => {
        const pathSegments = location.pathname.split("/");
        const isDiscussionPath = pathSegments.includes("discussionSpace");
        const isComparisonPath = pathSegments.includes("comparison");
        const isElementPath = pathSegments.includes("element");

        setRenderElementOutlet(!((isDiscussionPath || isComparisonPath) && !isElementPath));
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
        // Skip draft background change for instances of type "ComparisonSolution"
        if (isSolutionDraft && entityType === "Solution") {
            document.body.style.backgroundColor = "rgba(183,198,215,0.71)";

            return () => {
                document.body.style.backgroundColor = "";
            };
        }
    }, [entityType, isSolutionDraft]);


    const handleRetry = useCallback(() => {
        setRetryCount(1);
        setErrorMessage("");
    }, []);


    const detailsAreaClassName = () => {
        const baseClass = entityType === "Solution"
            ? "solution-details-area"
            : "solution-details-area-comparison";

        return currentSidePanelType && entityType === "Solution"
            ? `${baseClass} solution-details-area-side-panel-open`
            : baseClass;
    };


    return (
        solution ? (
            <>
                <div ref={solutionDetailsAreaRef} className={detailsAreaClassName()}>
                    <div ref={solutionDetailsContainerRef ? solutionDetailsContainerRef : null} className="solution-details-container" style={{width: `calc(50vw - ${getScrollbarWidth()}px)`}}>
                        <SolutionOverviewSection
                            solution={solution}
                            setSolution={setSolution}
                            entityType={entityType}
                            onToggleDiscussionSpace={onToggleDiscussionSpace}
                            onToggleComparison={onToggleComparison}
                            isUserAuthor={isUserAuthor}
                        />
                        <SolutionElementList
                            elements={solution.solutionElements}
                            elementDrafts={solution.elementDrafts}
                            entityType={entityType}
                            onToggleDiscussionSpace={onToggleDiscussionSpace}
                            onToggleComparison={onToggleComparison}
                            currentSidePanelType={currentSidePanelType}
                            parentNumber={solutionNumber}
                            isUserAuthor={isUserAuthor}
                        />
                        <ConsiderationList
                            considerations={solution.considerations}
                            parentType={"Solution"}
                            parentNumber={solutionNumber}
                            onSuccessfulSubmit={fetchSolutionData}
                            entityType={entityType}
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
                    isUserAuthor={isUserAuthor}
                    isChangeProposal={isChangeProposal}
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