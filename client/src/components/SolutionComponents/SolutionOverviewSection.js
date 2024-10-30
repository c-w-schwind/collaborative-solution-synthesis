import "./SolutionOverviewSection.css"
import {EDIT_ICON_SRC} from "../../constants";
import {useState} from "react";
import {useGlobal} from "../../context/GlobalContext";
import {useLoading} from "../../context/LoadingContext";
import {useFormData} from "../../context/FormDataContext";
import formSubmissionService from "../Forms/formSubmissionService";
import {formConfigurations} from "../Forms/formConfigurations";
import GenericForm from "../Forms/GenericForm";
import useOutsideClick from "../../hooks/useOutsideClickHook";


const SolutionOverviewSection = ({solution, setSolution, onToggleDiscussionSpace, isUserAuthor}) => {
    const [showMeta, setShowMeta] = useState(false);
    const isChangeProposal = Boolean(solution.changeProposalFor) && ["draft", "under_review", "proposal"].includes(solution.status);

    const {isSolutionDraft} = useGlobal();
    const {showLoading, hideLoading} = useLoading();
    const {
        solutionDraftTitleFormData, setSolutionDraftTitleFormData,
        solutionDraftOverviewFormData, setSolutionDraftOverviewFormData,
        solutionDraftDescriptionFormData, setSolutionDraftDescriptionFormData,
        solutionDraftChangeSummaryFormData, setSolutionDraftChangeSummaryFormData,
        toggleSolutionDraftTitleForm, toggleSolutionDraftOverviewForm, toggleSolutionDraftDescriptionForm, toggleSolutionDraftChangeSummaryForm,
        isSolutionDraftTitleFormOpen, isSolutionDraftOverviewFormOpen, isSolutionDraftDescriptionFormOpen, isSolutionDraftChangeSummaryFormOpen,
        isSolutionDraftTitleFormFilled, isSolutionDraftOverviewFormFilled, isSolutionDraftDescriptionFormFilled, isSolutionDraftChangeSummaryFormFilled
    } = useFormData();

    const metaRef = useOutsideClick(() => setShowMeta(false));


    const handleUpdateSolution = (updatedFields) => {
        setSolution(prevSolution => ({...prevSolution, ...updatedFields}));
    };

    const handleEditSubmit = async (formData, label, toggleSolutionDraftForm) => {
        const capitalizedKey = Object.keys(formData)[0].charAt(0).toUpperCase() + Object.keys(formData)[0].slice(1);
        showLoading(`Updating ${capitalizedKey}`);

        try {
            await formSubmissionService(`solutions/${solution.solutionNumber}`, formData, label, handleUpdateSolution, "PUT");
            toggleSolutionDraftForm(false);
        } catch (error) {
            throw error;
        } finally {
            hideLoading();
        }
    };

    const handleTitleEditSubmit = (formData) => handleEditSubmit(formData, "Solution Title", toggleSolutionDraftTitleForm);
    const handleOverviewEditSubmit = (formData) => handleEditSubmit(formData, "Solution Overview", toggleSolutionDraftOverviewForm);
    const handleDescriptionEditSubmit = (formData) => handleEditSubmit(formData, "Solution Description", toggleSolutionDraftDescriptionForm);
    const handleChangeSummaryEditSubmit = (formData) => handleEditSubmit(formData, "Solution Change Summary", toggleSolutionDraftChangeSummaryForm);

    const handleTitleEditButton = () => {
        if (!isSolutionDraftTitleFormFilled) {
            setSolutionDraftTitleFormData({title: solution.title});
        }
        toggleSolutionDraftTitleForm(false);
    }

    const handleOverviewEditButton = () => {
        if (!isSolutionDraftOverviewFormFilled) {
            setSolutionDraftOverviewFormData({overview: solution.overview});
        }
        toggleSolutionDraftOverviewForm(false);
    }

    const handleDescriptionEditButton = () => {
        if (!isSolutionDraftDescriptionFormFilled) {
            setSolutionDraftDescriptionFormData({description: solution.description});
        }
        toggleSolutionDraftDescriptionForm(false);
    }

    const handleChangeSummaryEditButton = () => {
        if (!isSolutionDraftChangeSummaryFormFilled) {
            setSolutionDraftChangeSummaryFormData({changeSummary: solution.changeSummary});
        }
        toggleSolutionDraftChangeSummaryForm(false);
    }

    const handleMetaButtonClick = () => setShowMeta(prev => !prev);


    const renderEditButton = (isOpen, onClick, label, style = {}) => {
        if (!isUserAuthor) return null;
        return (
            !isOpen && (
                <button className="draft-edit-button" onClick={onClick} style={style}>
                    {label} <img src={EDIT_ICON_SRC} alt="edit section"/>
                </button>
            )
        );
    }


    if (!solution) return <p>Loading solution details...</p>;

    return (
        <section className="solution-overview-section">
            <div className="solution-header">
                <h2 className="solution-title">
                    {(!isSolutionDraftTitleFormOpen || !isSolutionDraft) && solution.title}

                    {isSolutionDraft && renderEditButton(isSolutionDraftTitleFormOpen, handleTitleEditButton, "", {
                        alignSelf: "start",
                        margin: "0 15px",
                        paddingLeft: "9px",
                        paddingRight: "12px",
                        height: "30px"
                    })}

                    {isSolutionDraftTitleFormOpen && (
                        <div className="draft-form" style={{width: "30vw", marginTop: "-20px", fontSize: "16px", fontWeight: "lighter"}}>{/* Warning: Class referenced in handleBrowserNavigation for DOM checks. Changes need to be synchronized. */}
                            <GenericForm
                                onSubmit={handleTitleEditSubmit}
                                config={formConfigurations.draftTitleForm}
                                formData={solutionDraftTitleFormData}
                                setFormData={setSolutionDraftTitleFormData}
                                previousData={solution}
                                onCancel={toggleSolutionDraftTitleForm}
                            />
                        </div>
                    )}
                </h2>

                <div className="solution-element-button-section">
                    {!isSolutionDraft && <button className="action-button action-button--propose-changes">Propose Changes</button>}
                    <button className="action-button discussion-space-button" onClick={onToggleDiscussionSpace}>Discussion Space</button>
                    <div ref={metaRef} className="meta-button-container">
                        <button className={`action-button info-button ${showMeta ? "active" : ""}`} style={{padding: "8px 15px"}} onClick={handleMetaButtonClick}>i</button>
                        {showMeta && (
                            <div className="solution-overview-meta">
                                <span className="proposed-by">Proposed by: {solution.proposedBy.username}</span>
                                <span className="created-at">Created at: {isSolutionDraft ? "[unpublished]" : new Date(solution.createdAt).toLocaleDateString()}</span>
                                <span className="updated-at">Last Updated: {isSolutionDraft ? "[unpublished]" : new Date(solution.updatedAt).toLocaleDateString()}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isChangeProposal && <div className="solution-overview-and-details-container summary">
                <h3 className="solution-details-list-container-title">Summary of Proposed Changes</h3>
                {!isSolutionDraft || !isSolutionDraftChangeSummaryFormOpen ? (
                    <p className="solution-overview-section-text">{solution.changeSummary}</p>
                ) : (
                    <div className="draft-form">{/* Warning: Class referenced in handleBrowserNavigation for DOM checks. Changes need to be synchronized. */}
                        <GenericForm
                            onSubmit={handleChangeSummaryEditSubmit}
                            config={formConfigurations.draftChangeSummaryForm}
                            formData={solutionDraftChangeSummaryFormData}
                            setFormData={setSolutionDraftChangeSummaryFormData}
                            previousData={solution}
                            onCancel={toggleSolutionDraftChangeSummaryForm}
                        />
                    </div>
                )}

                {isSolutionDraft && renderEditButton(isSolutionDraftChangeSummaryFormOpen, handleChangeSummaryEditButton, "Edit Summary")}
            </div>}


            <div className="solution-overview-and-details-container">
                <h3 className="solution-details-list-container-title">Overview</h3>
                {!isSolutionDraft || !isSolutionDraftOverviewFormOpen ? (
                    <p className="solution-overview-section-text">{solution.overview}</p>
                ) : (
                    <div className="draft-form">{/* Warning: Class referenced in handleBrowserNavigation for DOM checks. Changes need to be synchronized. */}
                        <GenericForm
                            onSubmit={handleOverviewEditSubmit}
                            config={formConfigurations.draftOverviewForm}
                            formData={solutionDraftOverviewFormData}
                            setFormData={setSolutionDraftOverviewFormData}
                            previousData={solution}
                            onCancel={toggleSolutionDraftOverviewForm}
                        />
                    </div>
                )}

                {isSolutionDraft && renderEditButton(isSolutionDraftOverviewFormOpen, handleOverviewEditButton, "Edit Overview")}

                <h3 className="solution-details-list-container-title">Detailed Description</h3>
                {!isSolutionDraft || !isSolutionDraftDescriptionFormOpen ? (
                    <p className="solution-overview-section-text">{solution.description}</p>
                ) : (<div className="draft-form">{/* Warning: Class referenced in handleBrowserNavigation for DOM checks. Changes need to be synchronized. */}
                        <GenericForm
                            onSubmit={handleDescriptionEditSubmit}
                            config={formConfigurations.draftDescriptionForm}
                            formData={solutionDraftDescriptionFormData}
                            setFormData={setSolutionDraftDescriptionFormData}
                            previousData={solution}
                            onCancel={toggleSolutionDraftDescriptionForm}
                        />
                    </div>
                )}

                {isSolutionDraft && renderEditButton(isSolutionDraftDescriptionFormOpen, handleDescriptionEditButton, "Edit Description")}
            </div>
        </section>
    );
};

export default SolutionOverviewSection;