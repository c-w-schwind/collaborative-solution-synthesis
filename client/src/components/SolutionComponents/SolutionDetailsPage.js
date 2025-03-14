import "./SolutionDetailsPage.css";
import {Outlet, useLocation, useOutletContext, useParams} from "react-router-dom";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import SolutionOverviewSection from "./SolutionOverviewSection";
import SolutionElementList from "../SolutionElementComponents/SolutionElementList";
import ConsiderationList from "../ConsiderationComponents/ConsiderationList";
import LoadingRetryOverlay from "../CommonComponents/LoadingRetryOverlay";
import SolutionDraftFooter from "./SolutionDraftFooter";
import {useGlobal} from "../../context/GlobalContext";
import {useAuth} from "../../context/AuthContext";
import {getScrollbarWidth} from "../../utils/utils";
import {handleRequest} from "../../services/solutionApiService";
import useSolutionDraftOperations from "../../hooks/useSolutionDraftOperations";


function SolutionDetailsPage(props) {
    // In case of change proposal comparison view props will be imported via useOutletContext instead of HOC passing them down
    const {onToggleDiscussionSpace, onToggleComparison, currentSidePanelType, setEntityTitle, setEntityVersion, solutionDetailsContainerRef, solutionDetailsAreaRef, entityType} = useOutletContext() || props;

    const [solution, setSolution] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");
    const [isFooterDisabled, setIsFooterDisabled] = useState(false);

    const {user} = useAuth();
    const location = useLocation();
    const {solutionNumber, solutionVersion, comparisonEntityNumber} = useParams();
    const {isSolutionDraft, setIsSolutionDraft, setIsSolutionCP, shouldRefetchSolution, clearSolutionRefetchFlag} = useGlobal();

    const isUserAuthor = user?._id === solution?.proposedBy?._id;
    const isChangeProposal = Boolean(solution?.changeProposalFor) && ["draft", "under_review", "proposal"].includes(solution?.status);

    const {handleDiscardDraft, handleSubmitDraft, handlePublishSolution} = useSolutionDraftOperations(
        {solutionNumber, solutionVersion, title: solution?.title, status: solution?.status},
        isSolutionDraft,
        isChangeProposal
    );

    const pathSegments = location.pathname.split("/");
    const isDiscussionPath = pathSegments.includes("discussionSpace");
    const isComparisonPath = pathSegments.includes("comparison");
    const isElementPath = pathSegments.includes("element");

    const shouldRenderElementOutlet = useMemo(() => {
        return !((isDiscussionPath || isComparisonPath) && !isElementPath);
    }, [isDiscussionPath, isComparisonPath, isElementPath]);

    const stableEntityType = useRef(entityType);
    const stableSolutionNumber = useRef(solutionNumber);
    const stableComparisonEntityNumber = useRef(comparisonEntityNumber);


    const fetchSolutionData = useCallback(async () => {
        try {
            const entityNumber = stableEntityType.current === "ComparisonSolution" ? stableComparisonEntityNumber.current : stableSolutionNumber.current;
            const versionToFetch = stableEntityType.current === "ComparisonSolution" ? undefined : solutionVersion;

            const solutionData = await handleRequest("GET", "solution", entityNumber, versionToFetch);

            setSolution(solutionData);
            if (stableEntityType.current === "Solution") {
                setIsSolutionDraft(solutionData.status === "draft" || solutionData.status === "under_review");
                setIsSolutionCP(Boolean(solutionData.changeProposalFor));
                setEntityVersion(solutionData.versionNumber);
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
    }, [solutionVersion, setEntityVersion, setIsSolutionDraft, setIsSolutionCP, retryCount]);


    useEffect(() => {
        if (!stableEntityType.current || !stableSolutionNumber.current) return;
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
    }, [location.pathname, isElementPath]);

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
                            currentSidePanelType={currentSidePanelType}
                        />
                        <SolutionElementList
                            elements={solution.solutionElements}
                            elementDrafts={solution.elementDrafts}
                            entityType={entityType}
                            onToggleDiscussionSpace={onToggleDiscussionSpace}
                            onToggleComparison={onToggleComparison}
                            currentSidePanelType={currentSidePanelType}
                            parentSolutionNumber={solutionNumber}
                            isUserAuthor={isUserAuthor}
                            isPublicChangeProposal={solution.status === "proposal"}
                        />
                        <ConsiderationList
                            considerations={solution.considerations}
                            parentType={"Solution"}
                            parentNumber={solutionNumber}
                            parentVersionNumber={solutionVersion}
                            onSuccessfulSubmit={fetchSolutionData}
                            entityType={entityType}
                        />
                    </div>
                </div>

                {shouldRenderElementOutlet && <Outlet/>}

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