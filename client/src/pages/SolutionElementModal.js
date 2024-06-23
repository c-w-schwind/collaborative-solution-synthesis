import './SolutionElementModal.css'
import {useCallback, useEffect, useRef, useState} from "react";
import ConsiderationList from "../components/ConsiderationComponents/ConsiderationList";
import {debounce} from "../utils/utils";
import {useParams} from "react-router-dom";
import LoadingRetryOverlay from "../components/CommonComponents/LoadingRetryOverlay";


function SolutionElementModal({onToggleDiscussionSpace, onClosingModal, isDiscussionSpaceOpen, setEntityTitle}) {
    const [solutionElement, setSolutionElement] = useState(null);
    const [isTitleOverflowing, setIsTitleOverflowing] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    const titleRef = useRef(null);
    const {elementNumber} = useParams();

    const fetchSolutionElement = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/solutionElements/${elementNumber}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setSolutionElement(data.solutionElement);
            setRetryCount(0);
        } catch (err) {
            console.error('Failed to fetch element:', err);
            setTimeout(() => {
                if (retryCount < 4) {
                    setRetryCount(prev => prev + 1);
                }
            }, 5000);
        }
    }, [elementNumber, retryCount]);

    useEffect(() => {
        fetchSolutionElement();
    }, [fetchSolutionElement]);

    useEffect(() => {
        if(solutionElement) setEntityTitle(solutionElement.title);
    }, [solutionElement, setEntityTitle]);

    useEffect(() => {
        const checkOverflow = () => {
            if (titleRef.current) {
                const element = titleRef.current;
                const isOverflowing = element.offsetWidth < element.scrollWidth;
                setIsTitleOverflowing(isOverflowing);
            }
        };

        const timeoutId = setTimeout(() => {
            checkOverflow();
        }, 500);

        const debouncedCheckOverflow = debounce(checkOverflow, 100);
        window.addEventListener('resize', debouncedCheckOverflow);
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', debouncedCheckOverflow);
        };
    }, [solutionElement, isDiscussionSpaceOpen]);

    const handleRetry = () => {
        setRetryCount(1);
    };

    return (
        solutionElement !== null ? (
            <div className={`modal-container ${isDiscussionSpaceOpen ? 'solution-element-modal-ds-open' : ''}`} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 ref={titleRef}>
                        {solutionElement.title} ({solutionElement.elementType})
                        {isTitleOverflowing && <div className="full-title-overlay">{solutionElement.title} ({solutionElement.elementType})</div>}
                    </h2>
                    <div className="solution-element-button-section">
                        <button className="solution-element-action-button solution-element-action-button--propose">Propose Changes</button>
                        <button className="solution-element-action-button discussion-space-button" onClick={onToggleDiscussionSpace}>Discussion Space</button>
                        <button className="solution-element-action-button solution-element-action-button--close" aria-label="Close" onClick={onClosingModal}>X</button>
                    </div>
                </div>
                <div className="modal-container-scrollable">
                    <div className="solution-details-list-container" style={{marginTop: 0}}>
                        <h3 className={"solution-details-list-container-title"}>Overview</h3>
                        <p>{solutionElement.overview}</p>
                    </div>
                    <div className="solution-details-list-container">
                        <h3 className="solution-details-list-container-title">Detailed Description</h3>
                        <p>{solutionElement.description}</p>
                    </div>
                    <ConsiderationList considerations={solutionElement.considerations} onSuccessfulSubmit={fetchSolutionElement} parentType={"SolutionElement"} parentNumber={elementNumber}/>
                </div>
            </div>
        ) : (
            <LoadingRetryOverlay componentName={"element"} retryCount={retryCount} onHandleRetry={handleRetry}/>
        )
    );
}

export default SolutionElementModal;