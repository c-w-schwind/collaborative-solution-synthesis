import './SolutionElementModal.css'
import {useCallback, useEffect, useRef, useState} from "react";
import {useParams} from "react-router-dom";
import {useFormData} from "../../context/FormDataContext";
import {useGlobal} from "../../context/GlobalContext";
import formSubmissionService from "../Forms/formSubmissionService";
import {formConfigurations} from "../Forms/formConfigurations";
import ConsiderationList from "../ConsiderationComponents/ConsiderationList";
import GenericForm from "../Forms/GenericForm";
import LoadingRetryOverlay from "../CommonComponents/LoadingRetryOverlay";
import {debounce} from "../../utils/utils";
import {EDIT_ICON_SRC, DELETE_ICON_SRC, SUBMIT_ICON_SRC} from "../../constants";
import {useLayout} from "../../context/LayoutContext";
import {handleRequest} from "../../services/solutionApiService";
import useElementDraftOperations from "../../hooks/useElementDraftOperations";
import useOutsideClick from "../../hooks/useOutsideClickHook";
import {useLoading} from "../../context/LoadingContext";


function SolutionElementModal({onToggleDiscussionSpace, onClosingModal, isDiscussionSpaceOpen, setEntityTitle}) {
    const [solutionElement, setSolutionElement] = useState(null);
    const [isTitleOverflowing, setIsTitleOverflowing] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");
    const [isElementDraft, setIsElementDraft] = useState(false);
    const [isShowingInfo, setIsShowingInfo] = useState(false);

    const {setElementListChange, isSolutionDraft} = useGlobal();
    const {showLoading, hideLoading} = useLoading();
    const {elementNumber} = useParams();
    const {setElementOverlayColor} = useLayout();
    const {handleDiscardElementDraft, handleSubmitElementDraft, handlePublishElement} = useElementDraftOperations(
        {elementNumber, title: solutionElement?.title, status: solutionElement?.status},
        isElementDraft
    );
    const {
        elementDraftTitleFormData, setElementDraftTitleFormData,
        elementDraftOverviewFormData, setElementDraftOverviewFormData,
        elementDraftDescriptionFormData, setElementDraftDescriptionFormData,
        toggleElementDraftTitleForm, toggleElementDraftOverviewForm, toggleElementDraftDescriptionForm,
        isElementDraftTitleFormOpen, isElementDraftOverviewFormOpen, isElementDraftDescriptionFormOpen,
        isElementDraftTitleFormFilled, isElementDraftOverviewFormFilled, isElementDraftDescriptionFormFilled
    } = useFormData();

    const titleRef = useRef(null);
    const footerRef = useOutsideClick(() => setIsShowingInfo(false));


    const fetchSolutionElement = useCallback(async () => {
        try {
            const elementData = await handleRequest("GET", "element", elementNumber);
            setSolutionElement(elementData);
            setIsElementDraft(elementData.status === "draft" || elementData.status === "under_review");
            setRetryCount(0);
            setErrorMessage("");
        } catch (err) {
            console.error('Failed to fetch element:', err);
            setErrorMessage(err.message);
            setTimeout(() => {
                if (retryCount < 4) {
                    setRetryCount(prev => prev + 1);
                }
            }, 5000);
        }
    }, [elementNumber, retryCount, setIsElementDraft]);


    useEffect(() => {
        fetchSolutionElement();
    }, [fetchSolutionElement]);

    useEffect(() => {
        if (solutionElement) setEntityTitle(solutionElement.title);
    }, [solutionElement, setEntityTitle]);

    useEffect(() => {
        if (isElementDraft) {
            setElementOverlayColor("rgba(183,183,231,0.3)");
        } else {
            setElementOverlayColor("rgba(0, 0, 0, 0.5)");
        }
    }, [isElementDraft, setElementOverlayColor]);

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

        window.addEventListener('resize', debouncedCheckOverflow);

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', debouncedCheckOverflow);
        };
    }, [solutionElement, isDiscussionSpaceOpen]);


    const handleRetry = () => {
        setRetryCount(1);
    };

    const handleUpdateSolutionElement = (updatedFields) => {
        setSolutionElement(prevElement => ({...prevElement, ...updatedFields}));
    };

    const handleEditSubmit = async (formData, label, toggleElementDraftForm, changedField = {}) => {
        const capitalizedKey = Object.keys(changedField)[0].charAt(0).toUpperCase() + Object.keys(changedField)[0].slice(1);
        showLoading(`Updating ${capitalizedKey}`);

        try {
            await formSubmissionService(`solutionElements/${elementNumber}`, formData, label, handleUpdateSolutionElement, "PUT");
            toggleElementDraftForm(false);

            if (label !== "Solution Element Description") {
                setElementListChange({changeType: "update", elementNumber: Number(elementNumber), ...changedField});
            }
        } catch (error) {
            throw error;
        } finally {
            hideLoading();
        }
    };

    const handleTitleEditSubmit = (formData) => handleEditSubmit(formData, "Solution Element Title", toggleElementDraftTitleForm, {title: formData.title});
    const handleOverviewEditSubmit = (formData) => handleEditSubmit(formData, "Solution Element Overview", toggleElementDraftOverviewForm, {overview: formData.overview});
    const handleDescriptionEditSubmit = (formData) => handleEditSubmit(formData, "Solution Element Description", toggleElementDraftDescriptionForm, {description: formData.description});

    const handleTitleEditButton = () => {
        if (!isElementDraftTitleFormFilled) {
            setElementDraftTitleFormData({title: solutionElement.title});
        }
        toggleElementDraftTitleForm(false);
    }

    const handleOverviewEditButton = () => {
        if (!isElementDraftOverviewFormFilled) {
            setElementDraftOverviewFormData({overview: solutionElement.overview});
        }
        toggleElementDraftOverviewForm(false);
    }

    const handleDescriptionEditButton = () => {
        if (!isElementDraftDescriptionFormFilled) {
            setElementDraftDescriptionFormData({description: solutionElement.description});
        }
        toggleElementDraftDescriptionForm(false);
    }

    const handleInfoButtonClick = useCallback(() => {
        setIsShowingInfo(prev => !prev);
    },[]);


    const renderEditButton = (isOpen, onClick, label, style = {}) => (
        !isOpen && (
            <button className="draft-edit-button" onClick={onClick} style={style}>
                {label} <img src={EDIT_ICON_SRC} alt="edit section"/>
            </button>
        )
    );

    const getDisplayTitle = () => {
        if (isElementDraftTitleFormOpen) {
            return null;
        }
        return `${solutionElement.title} (${solutionElement.elementType})`;
    };


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
        <div className={`modal-container ${isDiscussionSpaceOpen ? 'solution-element-modal-ds-open' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
                <h2 className="element-title">
                    <span ref={titleRef} className="element-title-text">
                        {getDisplayTitle()}
                        {isTitleOverflowing && <div className="full-title-overlay">{getDisplayTitle()}</div>}
                    </span>

                    {isElementDraft && renderEditButton(isElementDraftTitleFormOpen, handleTitleEditButton, "", {
                        alignSelf: "start",
                        flexShrink: "0",
                        margin: "0 15px",
                        paddingLeft: "9px",
                        paddingRight: "12px",
                        height: "30px"
                    })}

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

                <div className="solution-element-button-section">
                    {!isElementDraft && <button className="action-button action-button--propose-changes">Propose Changes</button>}
                    <button className="action-button discussion-space-button" onClick={onToggleDiscussionSpace}>Discussion Space</button>
                    <button className="action-button action-button--close" aria-label="Close" onClick={onClosingModal}>X</button>
                </div>
            </div>

            <div className={`element-modal-footer-overlay ${isShowingInfo ? "element-modal-footer-overlay-active" : ""}`} onClick={() => setIsShowingInfo(false)}></div>

            <div className="modal-container-scrollable" style={isShowingInfo ? {maxHeight: "30vh"} : {}}>
                <div className="element-details-container" style={{marginTop: 0}}>
                    <h3 className={"solution-details-list-container-title"}>Overview</h3>
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
                    onSuccessfulSubmit={fetchSolutionElement}
                    parentType={"SolutionElement"}
                    parentNumber={elementNumber}
                />
            </div>

            {isElementDraft && <div ref={footerRef} className={`modal-footer ${isShowingInfo ? "expanded" : ""}`}>
                <div className="footer-top">
                    <h2>Solution Element Draft</h2>
                    <div className="solution-element-button-section">
                        <button className="action-button action-button--discard-draft" onClick={handleDiscardElementDraft}><img src={DELETE_ICON_SRC} alt="delete draft"/> Discard Draft</button>
                        {!isSolutionDraft && solutionElement.status === "draft" && <button className="action-button action-button--submit-draft" onClick={handleSubmitElementDraft}><img src={SUBMIT_ICON_SRC} alt="submit draft"/> Submit Proposal</button>}
                        {!isSolutionDraft && solutionElement.status === "under_review" && <button className="action-button action-button--submit-draft" onClick={handlePublishElement}><img src={SUBMIT_ICON_SRC} alt="submit draft"/> Submit Proposal</button>}
                        <button className="info-button info-button--footer" onClick={handleInfoButtonClick} aria-expanded={isShowingInfo} aria-controls="modal-footer-info">i</button>
                    </div>
                </div>
                <div className="modal-footer-info">
                    {isSolutionDraft ?
                        (
                            (<>
                                <p><strong>Discard Draft:</strong> This will permanently delete the current element draft. Use caution, as this action cannot be undone.</p>
                                {solutionElement.status === "draft" ? (
                                    <p><strong>Submitting Elements for Review:</strong> Since the solution is currently in draft mode, submitting an element for review is only possible in the context of submitting the complete solution. Can't submit a single element without submitting the whole solution. To submit the solution you have do that from the footer within the draft page of your solution.</p>
                                ) : (
                                    <p><strong>Publish Element:</strong> [Same as submitting, please write it also for publishing]</p>
                                )}
                            </>)
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
                    }
                </div>
            </div>}
        </div>
    );
}

export default SolutionElementModal;