import './withDiscussionSpace.css';
import {useEffect, useState} from 'react';
import SolutionDetailsPage from "../../pages/SolutionDetailsPage";
import SolutionElementModal from "../../pages/SolutionElementModal";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {debounce} from "../../utils/utils";

const withDiscussionSpace = (WrappedComponent, entityType) => {
    return function EnhancedComponent({...props}) {
        const [isDiscussionSpaceOpen, setIsDiscussionSpaceOpen] = useState(false);
        const [isSolutionDSOutletOpen, setIsSolutionDSOutletOpen] = useState(true);
        const [isOverlayActive, setIsOverlayActive] = useState(false);
        const [entityTitle, setEntityTitle] = useState('');
        const location = useLocation();
        const navigate = useNavigate();

        const handleToggleDiscussionSpace = () => {
            const willDiscussionSpaceBeOpen = !isDiscussionSpaceOpen;
            setIsDiscussionSpaceOpen(willDiscussionSpaceBeOpen);

            if (willDiscussionSpaceBeOpen) {
                navigate("./discussionSpace", {state: {fromNavigation: true}});
            } else {
                const isModal = entityType === 'SolutionElement';
                const baseSelector = isModal ? '.discussion-space-modal' : '.discussion-space-container';
                const discussionSpaceContainer = document.querySelector(baseSelector);
                if (discussionSpaceContainer) {
                    discussionSpaceContainer.addEventListener('transitionend', function onTransitionEnd(event) {
                        if (event.propertyName === 'opacity' || event.propertyName === 'width' || event.propertyName === 'left') {
                            discussionSpaceContainer.removeEventListener('transitionend', onTransitionEnd);
                            navigate(location.state?.fromNavigation ? -1 : ".", {relative: "path"});
                        }
                    });
                }
            }
        };

        const handleFullScreenButton = () => {
            navigate("./discussionSpace/fullscreen", {state: {entityTitle}});
        };

        const handleClosingModal = () => {
            setIsOverlayActive(false);
            const modalElement = document.querySelector('.overlay');
            if (modalElement) {
                modalElement.addEventListener('transitionend', function onTransitionEnd(event) {
                    if (event.propertyName === 'opacity') {
                        navigate(location.state?.fromElementCard ? -1 : "../..", {relative: "path"});
                        modalElement.removeEventListener('transitionend', onTransitionEnd);
                    }
                });
            }
        };

        const renderDiscussionSpace = () => {
            switch (entityType) {
                case 'Solution':
                    return (
                        <div className="discussion-space-sticky-frame">
                            <div className={`discussion-space-container ${isDiscussionSpaceOpen ? 'discussion-space-container-ds-open' : ''}`}>
                                <div className="modal-header">
                                    <h2>Discussion Space</h2>
                                    <div className="solution-element-button-section">
                                        <button className="solution-element-action-button solution-element-action-button--propose" onClick={handleFullScreenButton}>Full Screen Mode</button>
                                        <button className="solution-element-action-button solution-element-action-button--close" aria-label="Close" onClick={handleToggleDiscussionSpace}>X</button>
                                    </div>
                                </div>
                                <div className="modal-container-scrollable">
                                    {isSolutionDSOutletOpen && <Outlet/>}
                                </div>
                            </div>
                        </div>
                    );
                case 'SolutionElement':
                    return (
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
                    );
                default:
                    return null;
            }
        };

        // Update discussion space and solution outlet states & disable scrollbar when modal is open
        useEffect(() => {
            const pathSegments = location.pathname.split('/');
            const isDiscussionPath = pathSegments.includes('discussionSpace');
            const isElementPath = pathSegments.includes('element');

            if (!(entityType === "Solution" && isElementPath)) {
                setIsDiscussionSpaceOpen(isDiscussionPath);
            }

            // Delay DOM updates to ensure execution after React's render cycle
            const timeoutId = setTimeout(() => {
                if (isElementPath && entityType === 'Solution') {
                    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
                    document.body.style.overflow = 'hidden';
                    document.body.style.paddingRight = `${scrollbarWidth}px`;
                }
            }, 1);

            isElementPath ? setIsSolutionDSOutletOpen(false) : setIsSolutionDSOutletOpen(true);

            return () => {
                clearTimeout(timeoutId);
                document.body.style.overflow = '';
                document.body.style.paddingRight = '';
            };
        }, [location.pathname]);

        // Activate overlay for solution elements
        useEffect(() => {
            if (entityType !== "SolutionElement") return;

            // Ensure overlay activation happens after UI updates, preventing rendering glitches
            const timeoutId = setTimeout(() => {
                setIsOverlayActive(true);
            }, 0);

            return () => {
                clearTimeout(timeoutId);
                setIsOverlayActive(false);
            };
        }, []);

        // Ensure the discussion space scrolls in sync with the solution details container, adjusting heights for a flush stop at the same level
        useEffect(() => {
            if (entityType !== 'Solution' || !isDiscussionSpaceOpen) return;

            function adjustContainerHeight() {
                const entityContainer = document.querySelector('.entity-container-for-ds-addition');
                const solutionContainer = document.querySelector('.solution-details-container');

                if (entityContainer && solutionContainer) {
                    entityContainer.style.height = `${solutionContainer.offsetHeight}px`;
                    return true;
                }
                return false;
            }

            // Retry adjusting container height to handle cases where DOM elements might not be immediately ready
            function tryAdjustHeight(retries = 20) {
                if (!adjustContainerHeight() && retries > 0) {
                    setTimeout(() => tryAdjustHeight(retries - 1), 100);
                }
            }

            const solutionDetailsArea = document.querySelector('.solution-details-area');
            if (solutionDetailsArea) {
                solutionDetailsArea.addEventListener('transitionend', function onTransitionEnd(event) {
                    if (event.propertyName === 'width' || event.propertyName === 'left') {
                        solutionDetailsArea.removeEventListener('transitionend', onTransitionEnd);
                        adjustContainerHeight();
                    }
                });
            } else {
                tryAdjustHeight();
            }

            const debouncedAdjustContainerHeight = debounce(adjustContainerHeight, 100);
            window.addEventListener('resize', debouncedAdjustContainerHeight);

            return () => {
                window.removeEventListener('resize', debouncedAdjustContainerHeight);
            };
        }, [isDiscussionSpaceOpen]);

        // Preserve scroll position of solution details page after closing discussion space
        useEffect(() => {
            const originalScrollRestoration = window.history.scrollRestoration;
            if ('scrollRestoration' in window.history) {
                window.history.scrollRestoration = 'manual';
            }

            return () => {
                window.history.scrollRestoration = originalScrollRestoration;
            };
        }, []);

        return (
            <div className={entityType === "SolutionElement" ? `overlay ${isOverlayActive ? 'overlay-active' : ''}` : ''} onClick={entityType === "SolutionElement" ? handleClosingModal : undefined}>
                <div className="entity-container-for-ds-addition">
                    <WrappedComponent {...props} onToggleDiscussionSpace={handleToggleDiscussionSpace} onClosingModal={handleClosingModal} isDiscussionSpaceOpen={isDiscussionSpaceOpen} setEntityTitle={setEntityTitle}/>
                    {renderDiscussionSpace()}
                </div>
            </div>
        );
    };
};

const EnhancedSolutionDetailsPage = withDiscussionSpace(SolutionDetailsPage, "Solution");
const EnhancedSolutionElementModal = withDiscussionSpace(SolutionElementModal, "SolutionElement");

export {EnhancedSolutionDetailsPage, EnhancedSolutionElementModal};