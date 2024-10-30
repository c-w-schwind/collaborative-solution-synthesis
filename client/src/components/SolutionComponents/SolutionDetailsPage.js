import "./SolutionDetailsPage.css";
import {Outlet, useLocation, useParams} from "react-router-dom";
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


function SolutionDetailsPage({onToggleDiscussionSpace, isDiscussionSpaceOpen, setEntityTitle, solutionDetailsContainerRef}) {
    const [solution, setSolution] = useState(null);
    const [renderElementOutlet, setRenderElementOutlet] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");
    const [isFooterDisabled, setIsFooterDisabled] = useState(false);

    const {isSolutionDraft, setIsSolutionDraft, shouldRefetchSolution, clearSolutionRefetchFlag} = useGlobal();
    const location = useLocation();
    const {solutionNumber} = useParams();
    const {handleDiscardDraft, handleSubmitDraft, handlePublishSolution} = useDraftOperations(
        {solutionNumber: solution?.solutionNumber, title: solution?.title, status: solution?.status},
        isSolutionDraft
    );
    const {user} = useAuth();
    const isUserAuthor = user?._id === solution?.proposedBy?._id;
    const isChangeProposal = Boolean(solution?.changeProposalFor) && ["draft", "under_review", "proposal"].includes(solution?.status);


    const fetchSolutionData = useCallback(async () => {
        try {
            const solutionData = await handleRequest("GET", "solution", solutionNumber);
            setSolution(solutionData);
            setIsSolutionDraft(solutionData.status === "draft" || solutionData.status === "under_review");
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
    }, [solutionNumber, retryCount, setIsSolutionDraft]);


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
        };
    }, [isSolutionDraft]);


    const handleRetry = useCallback(() => {
        setRetryCount(1);
        setErrorMessage("");
    }, []);


    return (
        solution ? (
            <>
                <div className={`solution-details-area ${isDiscussionSpaceOpen ? "solution-details-area-ds-open" : ""}`}>
                    <div ref={solutionDetailsContainerRef} className="solution-details-container" style={{width: `calc(50vw - ${getScrollbarWidth()}px)`}}>
                        <SolutionOverviewSection
                            solution={solution}
                            setSolution={setSolution}
                            onToggleDiscussionSpace={onToggleDiscussionSpace}
                            isUserAuthor={isUserAuthor}
                        />
                        <SolutionElementList
                            elements={solution.solutionElements}
                            elementDrafts={solution.elementDrafts}
                            onToggleDiscussionSpace={onToggleDiscussionSpace}
                            isDiscussionSpaceOpen={isDiscussionSpaceOpen}
                            parentNumber={solutionNumber}
                            isUserAuthor={isUserAuthor}
                        />
                        <ConsiderationList
                            considerations={solution.considerations}
                            parentType={"Solution"}
                            parentNumber={solutionNumber}
                            onSuccessfulSubmit={fetchSolutionData}
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