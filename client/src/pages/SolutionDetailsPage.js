import './SolutionDetailsPage.css';
import {Outlet, useLocation, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import SolutionOverviewSection from "../components/SolutionComponents/SolutionOverviewSection";
import SolutionElementsList from "../components/SolutionComponents/SolutionElementList";
import ConsiderationsList from "../components/SolutionComponents/ConsiderationsList";


function SolutionDetailsPage({onToggleDiscussionSpace, isDiscussionSpaceOpen, setEntityTitle, solutionContainerRef}) {
    const {solutionNumber} = useParams();
    const [solution, setSolution] = useState(null);
    const [renderElementOutlet, setRenderElementOutlet] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [fetchAnimationDots, setFetchAnimationDots] = useState(".");
    const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const fetchSolution = async () => {
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
                        setFetchAnimationDots(fetchAnimationDots + ".");
                    }
                }, 3000);
            }
        };

        fetchSolution();
    }, [solutionNumber, retryCount]);

    useEffect(() => {
        if (solution) setEntityTitle(solution.title);
    }, [solution]);

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

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (!solution) setShowLoadingIndicator(true);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [solution]);

    const handleRetry = () => {
        setRetryCount(1);
        setFetchAnimationDots(".");
    };

    return (
        solution ? (
            <>
                {/*Added key to force rerender to avoid inheriting loading-retry-area styles during transitions*/}
                <div key={`solution-${solutionNumber}`} className={`solution-details-area ${isDiscussionSpaceOpen ? 'solution-details-area-ds-open' : ''}`}>
                    <div ref={solutionContainerRef} className="solution-details-container">
                        <SolutionOverviewSection solution={solution} onToggleDiscussionSpace={onToggleDiscussionSpace}/>
                        <SolutionElementsList elements={solution.solutionElements} onToggleDiscussionSpace={onToggleDiscussionSpace} isDiscussionSpaceOpen={isDiscussionSpaceOpen}/>
                        <ConsiderationsList considerations={solution.considerations}/>
                    </div>
                </div>
                {renderElementOutlet && <Outlet/>}
            </>
        ) : (
            <div className="loading-retry-area">
                <div className="loading-retry-container" style={{visibility: showLoadingIndicator ? 'visible' : 'hidden'}}>
                    {retryCount === 0 ? <p>Loading solution details... Please wait.</p> :
                        retryCount < 4 ? <p className="loading-retry-message">Attempting to load solution details again{fetchAnimationDots}</p> :
                            <p className="loading-retry-message">Couldn't load Solution Details.<br/>Please check your network connection or try again later.</p>}
                    {retryCount >= 4 ? <button className="retry-button" onClick={handleRetry}>Retry</button> : <span className="retry-placeholder"></span>}
                </div>
            </div>
        )
    );
}

export default SolutionDetailsPage;