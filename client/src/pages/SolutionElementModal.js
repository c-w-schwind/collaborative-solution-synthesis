import './SolutionElementModal.css'
import {useEffect, useRef, useState} from "react";
import ConsiderationsList from "../components/SolutionComponents/ConsiderationsList";
import {debounce} from "../utils/utils";
import {useParams} from "react-router-dom";


function SolutionElementModal({onToggleDiscussionSpace, onClosingModal, isDiscussionSpaceOpen, setEntityTitle}) {
    const [solutionElement, setSolutionElement] = useState(null);
    const [isTitleOverflowing, setIsTitleOverflowing] = useState(false);

    const titleRef = useRef(null);
    const {elementNumber} = useParams();

    useEffect(() => {
        const fetchSolutionElement = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/solutionElements/${elementNumber}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                setSolutionElement(data.solutionElement);
            } catch (err) {
                console.error('Failed to fetch element:', err);
            }
        };

        fetchSolutionElement();
    }, [elementNumber]);

    useEffect(() => {
        if(solutionElement) setEntityTitle(solutionElement.title);
    }, [solutionElement]);

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
                        <ConsiderationsList considerations={solutionElement.considerations}/>
                    </div>
                </div>
        ) : (
            <p>Loading Solution Element details...</p>
        )
    );
}

export default SolutionElementModal;