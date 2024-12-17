import "./withSidePanel.css";
import React, {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import SolutionDetailsPage from "../SolutionComponents/SolutionDetailsPage";
import SolutionElementModal from "../SolutionElementComponents/SolutionElementModal";
import {Outlet, useLocation, useNavigate, useParams} from "react-router-dom";
import {debounce} from "../../utils/utils";
import {useFormData} from "../../context/FormDataContext";
import {useGlobal} from "../../context/GlobalContext";


const withSidePanel = (WrappedComponent, entityType) => {
    return function EnhancedComponent({...props}) {
        const [pendingSidePanel, setPendingSidePanel] = useState(null);
        const [sidePanelType, setSidePanelType] = useState(null);
        const [displayedSidePanelType, setDisplayedSidePanelType] = useState(null);
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [entityTitle, setEntityTitle] = useState("");
        const [isElementDraft, setIsElementDraft] = useState(false);
        const [entityVersion, setEntityVersion] = useState(null);

        const location = useLocation();
        const navigate = useNavigate();
        const {canNavigate} = useFormData();
        const {requestSolutionRefetch} = useGlobal();
        const {solutionNumber, comparisonEntityNumber, elementVersion} = useParams();

        const entityContainerRef = useRef(null);
        const solutionDetailsContainerRef = useRef(null);
        const sidePanelContainerRef = useRef(null);
        const sidePanelModalRef = useRef(null);
        const solutionDetailsAreaRef = useRef(null);
        const overlayRef = useRef(null);


        const handleSolutionDetailsAreaTransitionEnd = useCallback((event, callback) => {
            if (event.propertyName === "width" || event.propertyName === "left") {
                callback();
            }
        }, []);

        const handleSidePanelTransitionEnd = useCallback((event, callback) => {
            if (event.propertyName === "opacity") {
                callback();
            }
        }, []);


        // Update side panel type based on URL and comparison solution outlet states
        useLayoutEffect(() => {
            const pathSegments = location.pathname.split("/");
            const isDiscussionSpacePath = pathSegments.includes("discussionSpace");
            const isComparisonPath = pathSegments.includes("comparison");
            const isElementPath = pathSegments.includes("element");

            // Ensures open side panel in case of direct URL navigation (without toggling)
            if (!(entityType === "Solution" && isElementPath)) {
                setSidePanelType(isDiscussionSpacePath ? "DiscussionSpace" : isComparisonPath ? "Comparison" : null);
                setDisplayedSidePanelType(isDiscussionSpacePath ? "DiscussionSpace" : isComparisonPath ? "Comparison" : null);
            }
        }, [location.pathname]);


        // Remove scroll function underneath element modal
        useLayoutEffect(() => {
            isModalOpen
                ? document.body.classList.add('body-scroll-lock')
                : document.body.classList.remove('body-scroll-lock');

            return () => {
                document.body.classList.remove('body-scroll-lock');
            };
        }, [isModalOpen]);


        // Activate overlay for solution elements
        useEffect(() => {
            if (entityType !== "SolutionElement") return;

            // Use RAF and setTimeout to activate overlay smoothly after UI updates, preventing rendering glitches (esp. when transitioning from open side panel)
            const rafId = requestAnimationFrame(() => {
                setTimeout(() => setIsModalOpen(true), 100);
            });

            return () => {
                cancelAnimationFrame(rafId);
                setIsModalOpen(false);
            };
        }, []);


        // Ensure side panel scrolls in sync with solution-details-container, adjusting heights for flush stop at the same level
        useEffect(() => {
            if (entityType !== "Solution" || !sidePanelType) return;

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
                    setTimeout(() => tryAdjustHeight(retries - 1), 200);
                }
            };

            const handleTransition = (event) => {
                handleSolutionDetailsAreaTransitionEnd(event, adjustContainerHeight);
            };

            const solutionDetailsArea = solutionDetailsAreaRef.current;
            if (solutionDetailsArea) {
                solutionDetailsArea.addEventListener("transitionend", handleTransition);
            } else {
                tryAdjustHeight();
            }

            const debouncedAdjustContainerHeight = debounce(adjustContainerHeight, 100);
            window.addEventListener("resize", debouncedAdjustContainerHeight);

            return () => {
                if (solutionDetailsArea) {
                    solutionDetailsArea.removeEventListener("transitionend", handleTransition);
                }
                window.removeEventListener("resize", debouncedAdjustContainerHeight);
            };
        }, [sidePanelType, handleSolutionDetailsAreaTransitionEnd]);


        // Preserve scroll position of solution details page after closing side panel
        useEffect(() => {
            const originalScrollRestoration = window.history.scrollRestoration;
            if ("scrollRestoration" in window.history) {
                window.history.scrollRestoration = "manual";
            }

            return () => {
                window.history.scrollRestoration = originalScrollRestoration;
            };
        }, []);


        // Handle pending side panel transitions (when toggling new side panel while different one is still open)
        useEffect(() => {
            if (!pendingSidePanel) return;

            const handleTransition = (event) => {
                handleSidePanelTransitionEnd(event, () => {
                    if (pendingSidePanel.type === "DiscussionSpace") {
                        navigate("./discussionSpace", {state: {entityVersion}});
                    } else if (pendingSidePanel.type === "Comparison") {
                        navigate(`./comparison/${pendingSidePanel.comparisonEntityNumber}`);
                    }

                    setDisplayedSidePanelType(pendingSidePanel.type);
                    setSidePanelType(pendingSidePanel.type);
                    setPendingSidePanel(null);
                });
            };

            const sidePanelContainer = entityType === "SolutionElement" ? sidePanelModalRef.current : sidePanelContainerRef.current;
            if (sidePanelContainer) {
                sidePanelContainer.addEventListener("transitionend", handleTransition);
            }

            return () => {
                if (sidePanelContainer) {
                    sidePanelContainer.removeEventListener("transitionend", handleTransition);
                }
            };
        }, [pendingSidePanel, handleSidePanelTransitionEnd, navigate, entityVersion]);


        // Handle side panel close transitions
        useEffect(() => {
            if (sidePanelType || pendingSidePanel) return;

            const handleTransition = (event) => {
                handleSidePanelTransitionEnd(event, () => {
                    // Case of no fromInAppNavigation happens when opening a Solution Element with open Discussion Space
                    navigate(location.state?.fromInAppNavigation ? -1 : ".", {relative: "path"});
                    setDisplayedSidePanelType(null);
                });
            };

            const sidePanelContainer = entityType === "SolutionElement" ? sidePanelModalRef.current : sidePanelContainerRef.current;
            if (sidePanelContainer) {
                sidePanelContainer.addEventListener("transitionend", handleTransition);
            }

            return () => {
                if (sidePanelContainer) {
                    sidePanelContainer.removeEventListener("transitionend", handleTransition);
                }
            };
        }, [sidePanelType, pendingSidePanel, handleSidePanelTransitionEnd, navigate, location.state?.fromInAppNavigation]);


        const toggleDiscussionSpace = useCallback((checkBeforeNavigation = true) => {
            if (checkBeforeNavigation && !canNavigate({checkDiscussionSpaceForm: true})) return;

            if (sidePanelType === "DiscussionSpace") {
                setSidePanelType(null);
            } else if (sidePanelType === "Comparison") {
                setPendingSidePanel({type: "DiscussionSpace"});
                setSidePanelType(null);
            } else {
                setSidePanelType("DiscussionSpace");
                navigate("./discussionSpace", {state: {fromInAppNavigation: true, entityVersion}});
            }
        }, [canNavigate, sidePanelType, navigate, entityVersion]);


        const toggleComparison = useCallback((comparisonEntityNumber = null) => {
            if (!canNavigate({checkDiscussionSpaceForm: true})) return;

            if (sidePanelType === "Comparison") {
                setSidePanelType(null);
            } else if (sidePanelType === "DiscussionSpace") {
                setPendingSidePanel({type: "Comparison", comparisonEntityNumber});
                setSidePanelType(null);
            } else {
                setSidePanelType("Comparison");
                navigate(`./comparison/${comparisonEntityNumber}`, {state: {fromInAppNavigation: true}});
            }
        }, [canNavigate, sidePanelType, navigate]);


        const handleFullScreenButton = useCallback(() => {
            if (canNavigate({checkSolutionDraftTitleForm: true, checkSolutionDraftChangeSummaryForm: true, checkSolutionDraftOverviewForm: true, checkSolutionDraftDescriptionForm: true, checkElementForm: true, checkElementDraftTitleForm: true, checkElementDraftChangeSummaryForm: true, checkElementDraftOverviewForm: true, checkElementDraftDescriptionForm: true, checkConsiderationForm: true, checkCommentForm: true, saveDiscussionSpaceData: true})) {
                const searchParams = new URLSearchParams(location.search);
                if (sidePanelType === "DiscussionSpace") {
                    navigate(`./discussionSpace/fullscreen?${searchParams.toString()}`, {state: {entityTitle, entityVersion}});
                } else {
                    window.location.href = entityType === "Solution" ? `/solutions/${comparisonEntityNumber}` : `/solutions/${solutionNumber}/element/${comparisonEntityNumber}`;
                }
            }
        }, [canNavigate, sidePanelType, navigate, entityTitle, entityVersion, comparisonEntityNumber, solutionNumber, location.search]);


        const handleClosingModal = useCallback((reopeningRoute = null) => {
            if (canNavigate({checkConsiderationForm: true, checkCommentForm: true, checkDiscussionSpaceForm: true, checkElementDraftTitleForm: true, checkElementDraftChangeSummaryForm: true, checkElementDraftOverviewForm: true, checkElementDraftDescriptionForm: true})) {
                setIsModalOpen(false);
                requestSolutionRefetch(Boolean(reopeningRoute));
                const modalElement = overlayRef.current;
                if (modalElement) {
                    const handleModalTransition = (event) => {
                        if (event.propertyName === "opacity") {
                            modalElement.removeEventListener("transitionend", handleModalTransition);
                            if (!reopeningRoute) {
                                navigate(location.state?.fromElementCard ? -1 : `../..${elementVersion ? "/.." : ""}`, {relative: "path"});
                            } else {
                                navigate(reopeningRoute);
                                setIsModalOpen(true);
                            }
                        }
                    };
                    modalElement.addEventListener("transitionend", handleModalTransition);
                }
            }
        }, [canNavigate, requestSolutionRefetch, navigate, location.state?.fromElementCard, elementVersion]);


        const stopPropagation = useCallback((e) => e.stopPropagation(), []);


        const solutionOutletContext = useMemo(() => ({
            onToggleDiscussionSpace: toggleDiscussionSpace,
            onToggleComparison: toggleComparison,
            currentSidePanelType: sidePanelType,
            setEntityTitle,
            entityType: "ComparisonSolution"
        }), [toggleDiscussionSpace, toggleComparison, sidePanelType]);

        const elementOutletContext = useMemo(() => ({
            onToggleDiscussionSpace: toggleDiscussionSpace,
            onToggleComparison: toggleComparison,
            onClosingModal: handleClosingModal,
            currentSidePanelType: sidePanelType,
            displayedSidePanelType,
            setEntityTitle,
            isElementDraft,
            setIsElementDraft,
            entityType: "ComparisonElement"
        }), [toggleDiscussionSpace, toggleComparison, handleClosingModal, sidePanelType, displayedSidePanelType, isElementDraft]);


        const renderSidePanel = useCallback(() => {
            switch (entityType) {
                case "Solution":
                    return (
                        <div className="side-panel-sticky-frame">
                            <div
                                ref={sidePanelContainerRef}
                                className={`side-panel-container ${sidePanelType ? "side-panel-container-side-panel-open" : ""}`}
                            >
                                <div className="modal-header">
                                    <h2>{sidePanelType === "DiscussionSpace" ? "Discussion Space" : "Original Solution"}</h2>
                                    <div className="button-section">
                                        <button
                                            className="action-button action-button--propose-changes"
                                            onClick={handleFullScreenButton}
                                        >
                                            {displayedSidePanelType === "DiscussionSpace" ? "Show Fullscreen" : "Go To Original"}
                                        </button>
                                        <button
                                            className="action-button action-button--close"
                                            aria-label="Close"
                                            onClick={sidePanelType === "DiscussionSpace" ? toggleDiscussionSpace : toggleComparison}
                                        >X</button>
                                    </div>
                                </div>
                                <div className={`modal-container-scrollable ${displayedSidePanelType === "Comparison" ? "comparison" : ""}`}>
                                    {!location.pathname.includes("/element/") && <Outlet context={solutionOutletContext}/>}
                                </div>
                            </div>
                        </div>
                    );
                case "SolutionElement":
                    return (
                        <div
                            ref={sidePanelModalRef}
                            className={`modal-container side-panel-modal ${sidePanelType ? "side-panel-modal-side-panel-open" : ""}`}
                            onClick={stopPropagation}
                        >
                            <div className="modal-header">
                                <h2>{sidePanelType === "DiscussionSpace" ? "Discussion Space" : "Original Element"}</h2>
                                <div className="button-section">
                                    <button
                                        className="action-button action-button--propose-changes"
                                        onClick={handleFullScreenButton}
                                    >
                                        {displayedSidePanelType === "DiscussionSpace" ? "Show Fullscreen" : "Go To Original"}
                                    </button>
                                    <button
                                        className="action-button action-button--close"
                                        aria-label="Close"
                                        onClick={sidePanelType === "DiscussionSpace" ? toggleDiscussionSpace : toggleComparison}
                                    >X
                                    </button>
                                </div>
                            </div>
                            <div className={`modal-container-scrollable ${displayedSidePanelType === "Comparison" ? "comparison" : ""}`}>
                                <Outlet context={elementOutletContext}/>
                            </div>
                        </div>
                    );
                default:
                    return null;
            }
        }, [sidePanelType, handleFullScreenButton, displayedSidePanelType, toggleDiscussionSpace, toggleComparison, location.pathname, solutionOutletContext, elementOutletContext, stopPropagation]);

        return (
            <div
                ref={overlayRef}
                className={entityType === "SolutionElement" ? `overlay ${isElementDraft ? "draft" : ""} ${isModalOpen ? "overlay-active" : ""}` : "solution-container"}
                onClick={entityType === "SolutionElement" ? () => handleClosingModal(null) : undefined}
            >
                <div ref={entityContainerRef} className="entity-container-for-side-panel-addition">
                    <WrappedComponent
                        {...props}
                        onToggleDiscussionSpace={toggleDiscussionSpace}
                        onToggleComparison={toggleComparison}
                        onClosingModal={handleClosingModal}
                        currentSidePanelType={sidePanelType}
                        setEntityTitle={setEntityTitle}
                        setEntityVersion={setEntityVersion}
                        solutionDetailsContainerRef={solutionDetailsContainerRef}
                        solutionDetailsAreaRef={solutionDetailsAreaRef}
                        entityType={entityType}
                        isElementDraft={isElementDraft}
                        setIsElementDraft={setIsElementDraft}
                    />
                    {renderSidePanel()}
                </div>
            </div>
        );
    };
};

const EnhancedSolutionDetailsPage = withSidePanel(SolutionDetailsPage, "Solution");
const EnhancedSolutionElementModal = withSidePanel(SolutionElementModal, "SolutionElement");

export {EnhancedSolutionDetailsPage, EnhancedSolutionElementModal};