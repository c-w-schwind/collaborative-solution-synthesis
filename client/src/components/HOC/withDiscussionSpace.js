import "./withDiscussionSpace.css";
import {useEffect, useLayoutEffect, useRef, useState} from "react";
import SolutionDetailsPage from "../SolutionComponents/SolutionDetailsPage";
import SolutionElementModal from "../SolutionElementComponents/SolutionElementModal";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {debounce} from "../../utils/utils";
import {useFormData} from "../../context/FormDataContext";
import {useLayout} from "../../context/LayoutContext";


const withDiscussionSpace = (WrappedComponent, entityType) => {
    return function EnhancedComponent({...props}) {
        const [isDiscussionSpaceOpen, setIsDiscussionSpaceOpen] = useState(false);
        const [isSolutionDSOutletOpen, setIsSolutionDSOutletOpen] = useState(true);
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [entityTitle, setEntityTitle] = useState("");

        const location = useLocation();
        const navigate = useNavigate();
        const {canNavigate} = useFormData();
        const {setIsOverlayActive, elementOverlayColor} = useLayout();

        const entityContainerRef = useRef();
        const solutionDetailsContainerRef = useRef();


        // Update discussion space and solution outlet states & disable scrollbar when modal is open
        useLayoutEffect(() => {
            const pathSegments = location.pathname.split("/");
            const isDiscussionPath = pathSegments.includes("discussionSpace");
            const isElementPath = pathSegments.includes("element");

            if (!(entityType === "Solution" && isElementPath)) {
                setIsDiscussionSpaceOpen(isDiscussionPath);
            }

            // Delay DOM updates to ensure execution after React's render cycle
            const rafId = requestAnimationFrame(() => {
                if (isElementPath && entityType === "Solution") {
                    setIsOverlayActive(true);
                }
            });

            setIsSolutionDSOutletOpen(!isElementPath);

            return () => {
                cancelAnimationFrame(rafId);
                setIsOverlayActive(false);
            };
        }, [location.pathname, setIsOverlayActive]);


        // Activate overlay for solution elements
        useEffect(() => {
            if (entityType !== "SolutionElement") return;

            // Use RAF and setTimeout to activate overlay smoothly after UI updates, preventing rendering glitches (esp. when transitioning from open discussion space)
            const rafId = requestAnimationFrame(() => {
                setTimeout(() => setIsModalOpen(true), 100);
            });

            return () => {
                cancelAnimationFrame(rafId);
                setIsModalOpen(false);
            };
        }, []);


        // Ensure the discussion space scrolls in sync with the solution details container, adjusting heights for a flush stop at the same level
        useEffect(() => {
            if (entityType !== "Solution" || !isDiscussionSpaceOpen) return;

            const adjustContainerHeight = () => {
                if (entityContainerRef.current && solutionDetailsContainerRef.current) {
                    entityContainerRef.current.style.height = `${solutionDetailsContainerRef.current.offsetHeight}px`;
                    return true;
                }
                return false;
            };

            // Retry adjusting container height to handle cases where DOM elements might not be immediately ready
            const tryAdjustHeight = (retries = 20) => {
                if (!adjustContainerHeight() && retries > 0) {
                    setTimeout(() => tryAdjustHeight(retries - 1), 100);
                }
            };

            const solutionDetailsArea = document.querySelector(".solution-details-area");
            if (solutionDetailsArea) {
                const handleTransitionEnd = (event) => {
                    if (event.propertyName === "width" || event.propertyName === "left") {
                        solutionDetailsArea.removeEventListener("transitionend", handleTransitionEnd);
                        adjustContainerHeight();
                    }
                };
                solutionDetailsArea.addEventListener("transitionend", handleTransitionEnd);

            } else {
                tryAdjustHeight();
            }

            const debouncedAdjustContainerHeight = debounce(adjustContainerHeight, 100);
            window.addEventListener("resize", debouncedAdjustContainerHeight);

            return () => {
                window.removeEventListener("resize", debouncedAdjustContainerHeight);
            };
        }, [isDiscussionSpaceOpen]);


        // Preserve scroll position of solution details page after closing discussion space
        useEffect(() => {
            const originalScrollRestoration = window.history.scrollRestoration;
            if ("scrollRestoration" in window.history) {
                window.history.scrollRestoration = "manual";
            }

            return () => {
                window.history.scrollRestoration = originalScrollRestoration;
            };
        }, []);


        const toggleDiscussionSpace = (checkBeforeNavigation = true) => {
            if (checkBeforeNavigation && !canNavigate({checkDiscussionSpaceForm: true})) return;

            const willDiscussionSpaceBeOpen = !isDiscussionSpaceOpen;
            setIsDiscussionSpaceOpen(willDiscussionSpaceBeOpen);

            if (willDiscussionSpaceBeOpen) {
                navigate("./discussionSpace", {state: {fromNavigation: true}});
            } else {
                const isModal = entityType === "SolutionElement";
                const baseSelector = isModal ? ".discussion-space-modal" : ".discussion-space-container";
                const discussionSpaceContainer = document.querySelector(baseSelector);
                if (discussionSpaceContainer) {
                    discussionSpaceContainer.addEventListener("transitionend", function onTransitionEnd(event) {
                        if (event.propertyName === "opacity") {
                            discussionSpaceContainer.removeEventListener("transitionend", onTransitionEnd);
                            navigate(location.state?.fromNavigation ? -1 : ".", {relative: "path"});
                        }
                    });
                }
            }
        };


        const handleFullScreenButton = () => {
            if (canNavigate({checkSolutionDraftTitleForm: true, checkSolutionDraftOverviewForm: true, checkSolutionDraftDescriptionForm: true, checkElementForm: true, checkElementDraftTitleForm: true, checkElementDraftOverviewForm: true, checkElementDraftDescriptionForm: true, checkConsiderationForm: true, checkCommentForm: true, saveDiscussionSpaceData: true})) {
                navigate("./discussionSpace/fullscreen", {state: {entityTitle}});
            }
        };


        const handleClosingModal = () => {
            if (canNavigate({checkConsiderationForm: true, checkCommentForm: true, checkDiscussionSpaceForm: true, checkElementDraftTitleForm: true, checkElementDraftOverviewForm: true, checkElementDraftDescriptionForm: true})) {
                setIsModalOpen(false);
                const modalElement = document.querySelector(".overlay");
                if (modalElement) {
                    modalElement.addEventListener("transitionend", function onTransitionEnd(event) {
                        if (event.propertyName === "opacity") {
                            navigate(location.state?.fromElementCard ? -1 : "../..", {relative: "path"});
                            modalElement.removeEventListener("transitionend", onTransitionEnd);
                        }
                    });
                }
            }
        };


        const renderDiscussionSpace = () => {
            switch (entityType) {
                case "Solution":
                    return (
                        <div className="discussion-space-sticky-frame">
                            <div className={`discussion-space-container ${isDiscussionSpaceOpen ? "discussion-space-container-ds-open" : ""}`}>
                                <div className="modal-header">
                                    <h2>Discussion Space</h2>
                                    <div className="solution-element-button-section">
                                        <button
                                            className="action-button action-button--propose-changes"
                                            onClick={handleFullScreenButton}
                                        >Fullscreen Mode</button>
                                        <button
                                            className="action-button action-button--close"
                                            aria-label="Close"
                                            onClick={toggleDiscussionSpace}
                                        >X</button>
                                    </div>
                                </div>
                                <div className="modal-container-scrollable">
                                    {isSolutionDSOutletOpen && <Outlet/>}
                                </div>
                            </div>
                        </div>
                    );
                case "SolutionElement":
                    return (
                        <div
                            className={`modal-container discussion-space-modal ${isDiscussionSpaceOpen ? "discussion-space-modal-ds-open" : ""}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2>Discussion Space</h2>
                                <div className="solution-element-button-section">
                                    <button
                                        className="action-button action-button--propose-changes"
                                        onClick={handleFullScreenButton}
                                    >Fullscreen Mode</button>
                                    <button
                                        className="action-button action-button--close"
                                        aria-label="Close"
                                        onClick={toggleDiscussionSpace}
                                    >X</button>
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


        return (
            <div
                className={entityType === "SolutionElement" ? `overlay ${isModalOpen ? "overlay-active" : ""}` : ""}
                onClick={entityType === "SolutionElement" ? handleClosingModal : undefined}
                style={entityType === "SolutionElement" ? {backgroundColor: elementOverlayColor} : {}}
            >
                <div ref={entityContainerRef} className="entity-container-for-ds-addition">
                    <WrappedComponent
                        {...props}
                        onToggleDiscussionSpace={toggleDiscussionSpace}
                        onClosingModal={handleClosingModal}
                        isDiscussionSpaceOpen={isDiscussionSpaceOpen}
                        setEntityTitle={setEntityTitle}
                        solutionDetailsContainerRef={solutionDetailsContainerRef}
                    />
                    {renderDiscussionSpace()}
                </div>
            </div>
        );
    };
};

const EnhancedSolutionDetailsPage = withDiscussionSpace(SolutionDetailsPage, "Solution");
const EnhancedSolutionElementModal = withDiscussionSpace(SolutionElementModal, "SolutionElement");

export {EnhancedSolutionDetailsPage, EnhancedSolutionElementModal};