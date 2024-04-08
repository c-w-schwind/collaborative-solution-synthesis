import './SolutionElementModal.css'
import {useEffect, useRef, useState} from "react";
import ConsiderationsList from "../components/SolutionComponents/ConsiderationsList";
import {debounce} from "../utils/utils";
import {Outlet, useLocation, useNavigate, useParams} from "react-router-dom";


function SolutionElementModal() {
    const [solutionElement, setSolutionElement] = useState(null);
    const [isOverlayActive, setIsOverlayActive] = useState(false);
    const [isDiscussionSpaceOpen, setIsDiscussionSpaceOpen] = useState(false);
    const [isTitleOverflowing, setIsTitleOverflowing] = useState(false);

    const titleRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
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

        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollbarWidth}px`;

        // Using delay to ensure CSS fade-in transition is visible, working around React's batched state updates.
        const timer = setTimeout(() => {
            setIsOverlayActive(true);
        }, 80);

        return () => {
            clearTimeout(timer);
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
            setIsOverlayActive(false);
        };
    }, [elementNumber]);

    useEffect(() => {
        const pathSegments = location.pathname.split('/');
        const isDiscussionPath = pathSegments.includes('discussionSpace');
        setIsDiscussionSpaceOpen(isDiscussionPath);
    }, [location.pathname]);


    useEffect(() => {
        const checkOverflow = () => {
            if (titleRef.current) {
                const element = titleRef.current;
                const isOverflowing = element.offsetWidth < element.scrollWidth;
                setIsTitleOverflowing(isOverflowing);
            }
        };

        const timeoutId = setTimeout(()=> {
            checkOverflow();
        }, 500);

        const debouncedCheckOverflow = debounce(checkOverflow, 100);
        window.addEventListener('resize', debouncedCheckOverflow);
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', debouncedCheckOverflow);
        };
    }, [solutionElement, isDiscussionSpaceOpen]);

    const handleClosing = (e) => {
        setIsOverlayActive(false);
        setTimeout(() => {
            setSolutionElement(null);
            navigate (location.state?.fromElementCard ? -1 : "../..", {relative: "path"});
        }, 200); // Matches the --transition-duration CSS variable in SolutionElementModal.css
    };

    const handleToggleDiscussionSpace = () => {
        const willDiscussionSpaceBeOpen = (!isDiscussionSpaceOpen);
        setIsDiscussionSpaceOpen(willDiscussionSpaceBeOpen);
        if (willDiscussionSpaceBeOpen) {
            navigate("./discussionSpace", {state: {parentType: 'SolutionElement', parentNumber: solutionElement.elementNumber, fromElementModal: true}});
        } else {
            setTimeout(() => {
                navigate (location.state?.fromElementModal ? -1 : ".", {relative: "path"});
            }, 400); // Matches the --transition-duration CSS variable in SolutionElementModal.css
        }
    }

    const handleFullScreenButton = () => {
        navigate("discussionSpace/fullscreen");
    }

    return (
        solutionElement !== null ? (
            <div className={`overlay ${isOverlayActive ? 'overlay-active' : ''}`} onClick={handleClosing}>

                <div className={`modal-container ${isDiscussionSpaceOpen ? 'solution-element-modal-ds-open' : ''}`} onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2 ref={titleRef}>
                            {solutionElement.title} ({solutionElement.elementType})
                            {isTitleOverflowing && <div className="full-title-overlay">{solutionElement.title} ({solutionElement.elementType})</div>}
                        </h2>
                        <div className="solution-element-button-section">
                            <button className="solution-element-action-button solution-element-action-button--propose">Propose Changes</button>
                            <button className="solution-element-action-button discussion-space-button" onClick={handleToggleDiscussionSpace}>Discussion Space</button>
                            <button className="solution-element-action-button solution-element-action-button--close" aria-label="Close" onClick={handleClosing}>X</button>
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

                <div className={`modal-container discussion-space-modal ${isDiscussionSpaceOpen ? 'discussion-space-modal-ds-open' : ''}`} onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>Discussion Space</h2>
                        <div className="solution-element-button-section">
                            <button className="solution-element-action-button solution-element-action-button--propose" onClick={handleFullScreenButton}>Full Screen Mode</button>
                            <button className="solution-element-action-button solution-element-action-button--close" aria-label="Close" onClick={handleToggleDiscussionSpace}>X</button>
                        </div>
                    </div>
                    <div className="modal-container-scrollable">
                        <Outlet/>
                    </div>
                </div>

            </div>
        ) : (
            <p>Loading Solution Element details...</p>
        )
    );
}

export default SolutionElementModal;