import "./SolutionElementModal.css";
import {EDIT_ICON_SRC, DELETE_ICON_SRC, SUBMIT_ICON_SRC, DISCUSSION_ICON_SRC} from "../../constants";
import {useCallback, useEffect, useRef, useState} from "react";
import {useAuth} from "../../context/AuthContext";
import {useLocation, useOutletContext, useParams} from "react-router-dom";
import {useGlobal} from "../../context/GlobalContext";
import {useLoading} from "../../context/LoadingContext";
import {useFormData} from "../../context/FormDataContext";
import formSubmissionService from "../Forms/formSubmissionService";
import {handleRequest} from "../../services/solutionApiService";
import useOutsideClick from "../../hooks/useOutsideClickHook";
import useElementDraftOperations from "../../hooks/useElementDraftOperations";
import {formConfigurations} from "../Forms/formConfigurations";
import ConsiderationList from "../ConsiderationComponents/ConsiderationList";
import GenericForm from "../Forms/GenericForm";
import ProposeChangeButton from "../Buttons/ProposeChangeButton";
import LoadingRetryOverlay from "../CommonComponents/LoadingRetryOverlay";
import {debounce} from "../../utils/utils";


function SolutionElementModal(props) {
    const {onToggleDiscussionSpace, onToggleComparison, onClosingModal, currentSidePanelType, displayedSidePanelType, setEntityTitle, setEntityVersion, isElementDraft, setIsElementDraft, entityType} = useOutletContext() || props;
    const [solutionElement, setSolutionElement] = useState(null);
    const [isTitleOverflowing, setIsTitleOverflowing] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");
    const [isChangeProposal, setIsChangeProposal] = useState(false);
    const [isElementProposal, setIsElementProposal] = useState(false);
    const [isShowingInfo, setIsShowingInfo] = useState(false);

    const {setElementListChange, isSolutionDraft} = useGlobal();
    const {showLoading, hideLoading} = useLoading();
    const {elementNumber, elementVersion, comparisonEntityNumber, comparisonEntityVersion} = useParams();
    const {handleDiscardElementDraft, handleSubmitElementDraft, handlePublishElement} = useElementDraftOperations(
        {elementNumber, elementVersion, title: solutionElement?.title, status: solutionElement?.status},
        isElementDraft,
        isChangeProposal
    );

    const location = useLocation();
    const {user} = useAuth();
    const isUserAuthor = user?._id === solutionElement?.proposedBy?._id;
    const discussionTooltipText = currentSidePanelType === "DiscussionSpace" ? "Close Discussion Space" : "Open Discussion Space";

    const {
        elementDraftTitleFormData, setElementDraftTitleFormData,
        elementDraftOverviewFormData, setElementDraftOverviewFormData,
        elementDraftDescriptionFormData, setElementDraftDescriptionFormData,
        elementDraftChangeSummaryFormData, setElementDraftChangeSummaryFormData,
        toggleElementDraftTitleForm, toggleElementDraftOverviewForm, toggleElementDraftDescriptionForm, toggleElementDraftChangeSummaryForm,
        isElementDraftTitleFormOpen, isElementDraftOverviewFormOpen, isElementDraftDescriptionFormOpen, isElementDraftChangeSummaryFormOpen,
        isElementDraftTitleFormFilled, isElementDraftOverviewFormFilled, isElementDraftDescriptionFormFilled, isElementDraftChangeSummaryFormFilled
    } = useFormData();

    const titleRef = useRef(null);
    const scrollContainerRef = useRef(null);
    const stableEntityType = useRef(entityType);
    const stableComparisonEntityNumber = useRef(comparisonEntityNumber);
    const stableComparisonEntityVersion = useRef(comparisonEntityVersion);

    const footerRef = useOutsideClick(() => setIsShowingInfo(false));


    const fetchElementData = useCallback(async () => {
        try {
            const entityNumber = stableEntityType.current === "ComparisonElement" ? stableComparisonEntityNumber.current : elementNumber;
            const versionNumber = stableEntityType.current === "ComparisonElement" ? stableComparisonEntityVersion.current : elementVersion;

            const elementData = await handleRequest("GET", "element", entityNumber, versionNumber);

            setSolutionElement(elementData);
            if (stableEntityType.current === "SolutionElement") {
                setIsElementDraft(elementData.status === "draft" || elementData.status === "under_review");
                setEntityVersion(elementData.versionNumber);
            }
            setIsChangeProposal(Boolean(elementData.changeProposalFor) && ["draft", "under_review", "proposal"].includes(elementData.status));
            setIsElementProposal(!Boolean(elementData.changeProposalFor) && elementData.status === "proposal");
            setRetryCount(0);
            setErrorMessage("");
        } catch (err) {
            console.error("Failed to fetch element:", err);
            setErrorMessage(err.message);
            if (retryCount < 4) {
                const retryTimeout = setTimeout(() => setRetryCount(prev => prev + 1), 5000);
                return () => clearTimeout(retryTimeout);
            }
        }
    }, [elementNumber, elementVersion, setEntityVersion, setIsElementDraft, retryCount]);


    useEffect(() => {
        setSolutionElement(null);
        fetchElementData();
    }, [elementNumber, fetchElementData]);

    useEffect(() => {
        if (solutionElement) setEntityTitle(solutionElement.title);
    }, [solutionElement, setEntityTitle]);

    useEffect(() => {
        const checkOverflow = () => {
            if (titleRef.current) {
                const element = titleRef.current;
                const isOverflowing = element.offsetWidth < element.scrollWidth;
                setIsTitleOverflowing(isOverflowing);
            }
        };

        const timeoutId = setTimeout(checkOverflow, 500);
        const debouncedCheckOverflow = debounce(checkOverflow, 100);

        window.addEventListener("resize", debouncedCheckOverflow);

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener("resize", debouncedCheckOverflow);
        };
    }, [solutionElement, currentSidePanelType]);


    const handleRetry = useCallback(() => {
        setRetryCount(1);
    }, []);

    const handleUpdateSolutionElement = useCallback((updatedFields) => {
        setSolutionElement(prevElement => ({...prevElement, ...updatedFields}));
    }, []);

    const handleEditSubmit = useCallback(async (formData, label, toggleElementDraftForm, changedField = {}) => {
        const capitalizedKey = Object.keys(changedField)[0].charAt(0).toUpperCase() + Object.keys(changedField)[0].slice(1);
        showLoading(`Updating ${capitalizedKey}`);

        try {
            await formSubmissionService(`solutionElements/${elementNumber}/${elementVersion}`, formData, label, handleUpdateSolutionElement, "PUT");
            toggleElementDraftForm(false);

            if (label !== "Solution Element Description") {
                setElementListChange({changeType: "update", elementNumber: Number(elementNumber), versionNumber: Number(elementVersion), ...changedField});
            }
        } catch (error) {
            throw error;
        } finally {
            hideLoading();
        }
    }, [elementNumber, elementVersion, showLoading, hideLoading, handleUpdateSolutionElement, setElementListChange]);

    const handleTitleEditSubmit = useCallback((formData) => handleEditSubmit(formData, "Solution Element Title", toggleElementDraftTitleForm, {title: formData.title}), [handleEditSubmit, toggleElementDraftTitleForm]);
    const handleOverviewEditSubmit = useCallback((formData) => handleEditSubmit(formData, "Solution Element Overview", toggleElementDraftOverviewForm, {overview: formData.overview}), [handleEditSubmit, toggleElementDraftOverviewForm]);
    const handleDescriptionEditSubmit = useCallback((formData) => handleEditSubmit(formData, "Solution Element Description", toggleElementDraftDescriptionForm, {description: formData.description}), [handleEditSubmit, toggleElementDraftDescriptionForm]);
    const handleChangeSummaryEditSubmit = useCallback((formData) => handleEditSubmit(formData, "Solution Element Change Summary", toggleElementDraftChangeSummaryForm, {changeSummary: formData.changeSummary}), [handleEditSubmit, toggleElementDraftChangeSummaryForm]);

    const handleTitleEditButton = useCallback(() => {
        if (!isElementDraftTitleFormFilled) {
            setElementDraftTitleFormData({title: solutionElement.title});
        }
        toggleElementDraftTitleForm(false);
    }, [isElementDraftTitleFormFilled, setElementDraftTitleFormData, solutionElement, toggleElementDraftTitleForm]);

    const handleOverviewEditButton = useCallback(() => {
        if (!isElementDraftOverviewFormFilled) {
            setElementDraftOverviewFormData({overview: solutionElement.overview});
        }
        toggleElementDraftOverviewForm(false);
    }, [isElementDraftOverviewFormFilled, setElementDraftOverviewFormData, solutionElement, toggleElementDraftOverviewForm]);

    const handleDescriptionEditButton = useCallback(() => {
        if (!isElementDraftDescriptionFormFilled) {
            setElementDraftDescriptionFormData({description: solutionElement.description});
        }
        toggleElementDraftDescriptionForm(false);
    }, [isElementDraftDescriptionFormFilled, setElementDraftDescriptionFormData, solutionElement, toggleElementDraftDescriptionForm]);

    const handleChangeSummaryEditButton = useCallback(() => {
        if (!isElementDraftChangeSummaryFormFilled) {
            setElementDraftChangeSummaryFormData({changeSummary: solutionElement.changeSummary});
        }
        toggleElementDraftChangeSummaryForm(false);
    }, [isElementDraftChangeSummaryFormFilled, setElementDraftChangeSummaryFormData, solutionElement, toggleElementDraftChangeSummaryForm]);

    const handleInfoButtonClick = useCallback(() => {
        setIsShowingInfo(prev => !prev);
    }, []);


    const renderEditButton = useCallback((isOpen, onClick, label, style = {}, tooltip) => {
        if (entityType === "ComparisonElement") return;
        return isUserAuthor && !isOpen && (
            <button
                className="draft-edit-button"
                onClick={onClick}
                style={style}
                data-tooltip-down={tooltip}
            >
                {label} <img src={EDIT_ICON_SRC} alt="edit section"/>
            </button>
        );
    }, [entityType, isUserAuthor]);

    const renderComparisonButton = useCallback(() => {
        const pathSegments = location.pathname.split("/");
        const isComparisonPath = pathSegments.includes("comparison");

        return (
            <button className="comparison-button" onClick={() => onToggleComparison(solutionElement.originalElementNumber)}>
                {isComparisonPath ? "Close Comparison" : "Compare with Original"}
            </button>
        );
    }, [location, onToggleComparison, solutionElement?.originalElementNumber]);

    const getDisplayTitle = useCallback(() => {
        if (isElementDraftTitleFormOpen) {
            return null;
        }
        return `${solutionElement.title} (${solutionElement.elementType})`;
    }, [isElementDraftTitleFormOpen, solutionElement]);

    const getFooterTitle = useCallback(() => {
        let title = solutionElement.status === "draft" ? "Draft - " : "Review Phase - ";
        title += isChangeProposal ? "Change Proposal" : "New Element";

        return <h2>{title}</h2>
    }, [solutionElement, isChangeProposal])

    const outerClassName = () => {
        let className = "modal-container";

        if (entityType === "SolutionElement") {
            className += currentSidePanelType ? " solution-element-modal-side-panel-open" : "";
        } else {
            className += displayedSidePanelType ? " comparison" : "";
        }

        return className;
    }


    if (solutionElement === null) {
        return (
            <LoadingRetryOverlay
                componentName="element"
                retryCount={retryCount}
                onHandleRetry={handleRetry}
                errorMessage={errorMessage}
            />
        );
    }


    return (
        <div className={outerClassName()} onClick={(e) => e.stopPropagation()}>
            <div className={entityType === "SolutionElement" ? "modal-header" : ""}>
                <div className="title-container">
                    <h2 className="element-title" style={entityType === "ComparisonElement" ? {padding: "0 30px", marginBottom: 0} : {}}>
                        {entityType === "SolutionElement" ? (
                            <span ref={titleRef} className="element-title-text">
                                {getDisplayTitle()}
                                {isTitleOverflowing && <div className="full-title-overlay">{getDisplayTitle()}</div>}
                            </span>
                        ) : (
                            getDisplayTitle()
                        )}

                        {isElementDraftTitleFormOpen && (
                            <div className="draft-form" style={{width: "30vw", marginTop: "-20px", fontSize: "16px", fontWeight: "lighter", textWrap: "wrap"}}>{/* Warning: Class referenced in handleBrowserNavigation for DOM checks. Changes need to be synchronized. */}
                                <GenericForm
                                    onSubmit={handleTitleEditSubmit}
                                    config={formConfigurations.draftTitleForm}
                                    formData={elementDraftTitleFormData}
                                    setFormData={setElementDraftTitleFormData}
                                    previousData={solutionElement}
                                    onCancel={toggleElementDraftTitleForm}
                                />
                            </div>
                        )}
                    </h2>

                    {isElementDraft && renderEditButton(isElementDraftTitleFormOpen, handleTitleEditButton, "", {
                        alignSelf: "start",
                        flexShrink: "0",
                        margin: "0 15px",
                        paddingLeft: "9px",
                        paddingRight: "12px",
                        width: "37px"
                    }, "Edit Title")}
                </div>

                <div className="button-section">
                    {!isElementDraft && !isChangeProposal && !isElementProposal && entityType === "SolutionElement" && <ProposeChangeButton entityType={entityType} entityTitle={solutionElement.title} entityNumber={elementNumber} onClosingModal={onClosingModal}/>}
                    {entityType === "SolutionElement" && <button className="action-button icon-action-button discussion-space-button" data-tooltip-down={discussionTooltipText} onClick={onToggleDiscussionSpace}><img src={DISCUSSION_ICON_SRC} alt="discussion space"/></button>}
                    {entityType === "SolutionElement" && <button className="action-button action-button--close" aria-label="Close" onClick={() => onClosingModal(null)}>X</button>}
                </div>
            </div>

            <div className={`element-modal-footer-overlay ${isShowingInfo ? "element-modal-footer-overlay-active" : ""}`} onClick={() => setIsShowingInfo(false)}></div>

            <div ref={scrollContainerRef} className={entityType === "SolutionElement" ? "modal-container-scrollable" : "modal-container-non-scrollable"} style={isShowingInfo ? {maxHeight: "30vh"} : {}}>

                {isChangeProposal && <div className="element-details-container change-summary">
                    <div className="solution-header">
                        <h3 className="solution-details-list-container-title">Summary of Proposed Changes</h3>
                        {isChangeProposal && renderComparisonButton()}
                    </div>
                    {!isElementDraft || !isElementDraftChangeSummaryFormOpen ? (
                        <p className="solution-overview-section-text">{solutionElement.changeSummary}</p>
                    ) : (<div className="draft-form">{/* Warning: Class referenced in handleBrowserNavigation for DOM checks. Changes need to be synchronized. */}
                            <GenericForm
                                onSubmit={handleChangeSummaryEditSubmit}
                                config={formConfigurations.draftChangeSummaryForm}
                                formData={elementDraftChangeSummaryFormData}
                                setFormData={setElementDraftChangeSummaryFormData}
                                previousData={solutionElement}
                                onCancel={toggleElementDraftChangeSummaryForm}
                            />
                        </div>
                    )}
                    {isElementDraft && renderEditButton(isElementDraftChangeSummaryFormOpen, handleChangeSummaryEditButton, "Edit Summary")}
                </div>}

                <div className="element-details-container">
                    <h3 className="solution-details-list-container-title">Overview</h3>
                    {!isElementDraft || !isElementDraftOverviewFormOpen ? (
                        <p>{solutionElement.overview}</p>
                    ) : (
                        <div className="draft-form">{/* Warning: Class referenced in handleBrowserNavigation for DOM checks. Changes need to be synchronized. */}
                            <GenericForm
                                onSubmit={handleOverviewEditSubmit}
                                config={formConfigurations.draftOverviewForm}
                                formData={elementDraftOverviewFormData}
                                setFormData={setElementDraftOverviewFormData}
                                previousData={solutionElement}
                                onCancel={toggleElementDraftOverviewForm}
                            />
                        </div>
                    )}
                    {isElementDraft && renderEditButton(isElementDraftOverviewFormOpen, handleOverviewEditButton, "Edit Overview")}
                </div>

                <div className="element-details-container">
                    <h3 className="solution-details-list-container-title">Detailed Description</h3>
                    {!isElementDraft || !isElementDraftDescriptionFormOpen ? (
                        <p>{solutionElement.description}</p>
                    ) : (<div className="draft-form">{/* Warning: Class referenced in handleBrowserNavigation for DOM checks. Changes need to be synchronized. */}
                            <GenericForm
                                onSubmit={handleDescriptionEditSubmit}
                                config={formConfigurations.draftDescriptionForm}
                                formData={elementDraftDescriptionFormData}
                                setFormData={setElementDraftDescriptionFormData}
                                previousData={solutionElement}
                                onCancel={toggleElementDraftDescriptionForm}
                            />
                        </div>
                    )}
                    {isElementDraft && renderEditButton(isElementDraftDescriptionFormOpen, handleDescriptionEditButton, "Edit Description")}
                </div>

                <ConsiderationList
                    considerations={solutionElement.considerations}
                    parentType={"SolutionElement"}
                    parentNumber={elementNumber}
                    parentVersionNumber={elementVersion}
                    onSuccessfulSubmit={fetchElementData}
                    entityType={entityType}
                    scrollContainerRef={scrollContainerRef}
                />
            </div>

            {isElementDraft && entityType === "SolutionElement" && <div ref={footerRef} className={`modal-footer ${isShowingInfo ? "expanded" : ""}`}>
                <div className="footer-top">
                    {getFooterTitle()}
                    <div className="button-section">
                        {isUserAuthor && <button className="action-button action-button--discard-draft" onClick={handleDiscardElementDraft}><img src={DELETE_ICON_SRC} alt="delete draft"/> Discard Element</button>}
                        {!isSolutionDraft && solutionElement.status === "draft" && <button className="action-button action-button--submit-draft" onClick={handleSubmitElementDraft}><img src={SUBMIT_ICON_SRC} alt="submit draft"/> Submit Proposal</button>}
                        {!isSolutionDraft && solutionElement.status === "under_review" && isUserAuthor && <button className="action-button action-button--submit-draft" onClick={handlePublishElement}><img src={SUBMIT_ICON_SRC} alt="publish proposal"/> Publish Proposal</button>}
                        <button className="info-button info-button--footer" onClick={handleInfoButtonClick} aria-expanded={isShowingInfo} aria-controls="modal-footer-info">i</button>
                    </div>
                </div>
                <div className="modal-footer-info">
                    {isUserAuthor ? (
                        isSolutionDraft ? (
                            <>
                                <p><strong>Discard Draft:</strong> This will permanently delete the current element draft. Use caution, as this action cannot be undone.</p>
                                {solutionElement.status === "draft" ? (
                                    <p><strong>Submitting Elements for Review:</strong> Since the solution is currently in draft mode, submitting an element for review is only possible in the context of submitting the complete solution. Can't submit a single element without submitting the whole solution. To submit the solution you have do that from the footer within the draft page of your solution.</p>
                                ) : (
                                    <p><strong>Publish Element:</strong> Something something, Caroline</p>
                                )}
                            </>
                        ) : (
                            <>
                                <p><strong>Discard Draft:</strong> This action will remove your current draft.</p>
                                {solutionElement.status === "draft" ? (
                                    <p><strong>Submit Proposal:</strong> Submitting will send your draft for review.</p>
                                ) : (
                                    <p><strong>Publish Solution:</strong> Publishing will make your solution live.</p>
                                )}
                            </>
                        )
                    ) : (
                        isSolutionDraft ? (
                            <p><strong>Review Phase:</strong> This is a description for how the review phase works. You are one of the three assigned reviewers to look over the solution and do some shit. You're currently reviewing an element within the context of a draft for a completely new solution. Make sure to consider its role in the broader solution and the interplay with the other elements proposed.<br/>Text could be a bit bigger, though.</p>
                        ) : (
                            <p><strong>Review Phase:</strong>{`This is a description for how the review phase works. You are one of the three assigned reviewers to look over this ${isChangeProposal ? "change proposal for an element" : "proposal for a new element"} and do some shit. Make sure to consider its role in the broader solution and the interplay with the other elements already established.`}<br/>Text could be a bit bigger, though.</p>
                        )
                    )}
                </div>
            </div>}
        </div>
    );
}

export default SolutionElementModal;