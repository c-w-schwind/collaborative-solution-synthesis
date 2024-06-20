import './SolutionDetailsPage.css';
import {Outlet, useLocation, useParams} from "react-router-dom";
import {useCallback, useEffect, useState} from "react";
import SolutionOverviewSection from "../components/SolutionComponents/SolutionOverviewSection";
import SolutionElementsList from "../components/SolutionComponents/SolutionElementList";
import ConsiderationsList from "../components/ConsiderationComponents/ConsiderationsList";
import LoadingRetryOverlay from "../components/CommonComponents/LoadingRetryOverlay";

function SolutionDetailsPage({onToggleDiscussionSpace, isDiscussionSpaceOpen, setEntityTitle, solutionContainerRef}) {
    const {solutionNumber} = useParams();
    const [solution, setSolution] = useState(null);
    const [renderElementOutlet, setRenderElementOutlet] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const location = useLocation();

    const fetchSolution = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/solutions/${solutionNumber}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setSolution(data.solution);
            setRetryCount(0);
        } catch (err) {
            console.error('Failed to fetch solution:', err);
            setTimeout(() => {
                if (retryCount < 4) {
                    setRetryCount(prev => prev + 1);
                }
            }, 5000);
        }
    }, [solutionNumber, retryCount]);

    useEffect(() => {
        fetchSolution();
    }, [fetchSolution]);

    useEffect(() => {
        if (solution) setEntityTitle(solution.title);
    }, [solution, setEntityTitle]);

    useEffect(() => {
        const pathSegments = location.pathname.split('/');
        const isDiscussionPath = pathSegments.includes('discussionSpace');
        const isElementPath = pathSegments.includes('element');
        if (isDiscussionPath && !isElementPath) {
            setRenderElementOutlet(false);
        } else {
            setRenderElementOutlet(true);
        }
    }, [location.pathname]);

    const handleRetry = () => {
        setRetryCount(1);
    };

    return (
        solution ? (
            <>
                <div className={`solution-details-area ${isDiscussionSpaceOpen ? 'solution-details-area-ds-open' : ''}`}>
                    <div ref={solutionContainerRef} className="solution-details-container">
                        <SolutionOverviewSection
                            solution={solution}
                            onToggleDiscussionSpace={onToggleDiscussionSpace}
                        />
                        <SolutionElementsList
                            elements={solution.solutionElements}
                            onToggleDiscussionSpace={onToggleDiscussionSpace}
                            isDiscussionSpaceOpen={isDiscussionSpaceOpen}
                            parentNumber={solutionNumber}
                        />
                        <ConsiderationsList
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
            <LoadingRetryOverlay componentName={"solution"} retryCount={retryCount} onHandleRetry={handleRetry}/>
        )
    );
}

export default SolutionDetailsPage;