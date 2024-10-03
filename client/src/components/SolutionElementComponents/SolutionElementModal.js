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
import {EDIT_ICON_SRC} from "../../constants";


function SolutionElementModal({onToggleDiscussionSpace, onClosingModal, isDiscussionSpaceOpen, setEntityTitle}) {
    const [solutionElement, setSolutionElement] = useState(null);
    const [isTitleOverflowing, setIsTitleOverflowing] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");
    const [isElementDraft, setIsElementDraft] = useState(false);

    const titleRef = useRef(null);
    const {setWasElementListEdited} = useGlobal();
    const {elementNumber} = useParams();

    const {
        elementDraftTitleFormData, setElementDraftTitleFormData,
        elementDraftOverviewFormData, setElementDraftOverviewFormData,
        elementDraftDescriptionFormData, setElementDraftDescriptionFormData,
        toggleElementDraftTitleForm, toggleElementDraftOverviewForm, toggleElementDraftDescriptionForm,
        isElementDraftTitleFormOpen, isElementDraftOverviewFormOpen, isElementDraftDescriptionFormOpen,
        isElementDraftTitleFormFilled, isElementDraftOverviewFormFilled, isElementDraftDescriptionFormFilled
    } = useFormData();


    const fetchSolutionElement = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(`${process.env.REACT_APP_API_URL}/solutionElements/${elementNumber}`, {
                headers: token
                    ? {"Authorization": `Bearer ${token}`, "Content-Type": "application/json"}
                    : {}
            });

            if (!response.ok) {
                if (response.status === 401) {
                    const errorMessage = token
                        ? "This solution element is private.\n\n\nYou don't have access to view it."
                        : "Unauthorized access.\n\n\nPlease log in to view this solution element.";
                    throw new Error(errorMessage);
                }
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            setSolutionElement(data);
            setIsElementDraft(data.status === "draft");
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
        if (isElementDraft) document.querySelector(".overlay").style.backgroundColor = "rgba(183,183,231,0.3)";
    }, [isElementDraft]);

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

    const handleEditSubmit = async (formData, label, toggleElementDraftForm) => {
        await formSubmissionService(`solutionElements/${solutionElement.elementNumber}`, formData, label, handleUpdateSolutionElement, "PUT");
        toggleElementDraftForm(false);
        setWasElementListEdited(true);
    };

    const handleTitleEditSubmit = (formData) => handleEditSubmit(formData, "Solution Element Title", toggleElementDraftTitleForm);
    const handleOverviewEditSubmit = (formData) => handleEditSubmit(formData, "Solution Element Overview", toggleElementDraftOverviewForm);
    const handleDescriptionEditSubmit = (formData) => handleEditSubmit(formData, "Solution Element Description", toggleElementDraftDescriptionForm);

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


    const renderEditButton = (isOpen, onClick, label, style = {}) => (
        !isOpen && (
            <button className="solution-draft-edit-button" onClick={onClick} style={style}>
                {label} <img src={EDIT_ICON_SRC} alt="edit section"/>
            </button>
        )
    );

    const getDisplayTitle = () => {
        if (isElementDraftTitleFormOpen) {
            return null;
        }

        let title = `${solutionElement.title} (${solutionElement.elementType})`;
        if (isElementDraft) title = `[DRAFT] ${title}`;

        return title;
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
                    <button className="solution-element-action-button solution-element-action-button--propose">Propose Changes</button>
                    <button className="solution-element-action-button discussion-space-button" onClick={onToggleDiscussionSpace}>Discussion Space</button>
                    <button className="solution-element-action-button solution-element-action-button--close" aria-label="Close" onClick={onClosingModal}>X</button>
                </div>
            </div>

            <div className="modal-container-scrollable">
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
        </div>
    );
}

export default SolutionElementModal;