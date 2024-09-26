import "./SolutionOverviewSection.css"
import {useState} from "react";
import {useGlobal} from "../../context/GlobalContext";
import {useFormData} from "../../context/FormDataContext";
import formSubmissionService from "../Forms/formSubmissionService";
import {formConfigurations} from "../Forms/formConfigurations";
import GenericForm from "../Forms/GenericForm";
import useOutsideClick from "../../hooks/useOutsideClickHook";
import {EDIT_ICON_SRC} from "../../constants";

const SolutionOverviewSection = ({solution, setSolution, onToggleDiscussionSpace}) => {
    const [showMeta, setShowMeta] = useState(false);

    const {isSolutionDraft} = useGlobal();
    const {
        solutionDraftTitleFormData, setSolutionDraftTitleFormData,
        solutionDraftOverviewFormData, setSolutionDraftOverviewFormData,
        solutionDraftDescriptionFormData, setSolutionDraftDescriptionFormData,
        toggleSolutionDraftTitleForm, toggleSolutionDraftOverviewForm, toggleSolutionDraftDescriptionForm,
        isSolutionDraftTitleFormOpen, isSolutionDraftOverviewFormOpen, isSolutionDraftDescriptionFormOpen,
        isSolutionDraftTitleFormFilled, isSolutionDraftOverviewFormFilled, isSolutionDraftDescriptionFormFilled
    } = useFormData();

    const metaRef = useOutsideClick(() => setShowMeta(false));


    const handleUpdateSolution = (updatedFields) => {
        setSolution(prevSolution => ({...prevSolution, ...updatedFields}));
    };

    const handleEditSubmit = async (formData, label, toggleSolutionDraftForm) => {
        await formSubmissionService(`solutions/${solution.solutionNumber}`, formData, label, handleUpdateSolution, "PUT");
        toggleSolutionDraftForm(false);
    };

    const handleTitleEditSubmit = (formData) => handleEditSubmit(formData, "Solution Title", toggleSolutionDraftTitleForm);
    const handleOverviewEditSubmit = (formData) => handleEditSubmit(formData, "Solution Overview", toggleSolutionDraftOverviewForm);
    const handleDescriptionEditSubmit = (formData) => handleEditSubmit(formData, "Solution Description", toggleSolutionDraftDescriptionForm);

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

    const handleMetaButtonClick = () => setShowMeta(prev => !prev);


    const renderEditButton = (isOpen, onClick, label, style = {}) => (
        !isOpen && (
            <button className="solution-draft-edit-button" onClick={onClick} style={style}>
                {label} <img src={EDIT_ICON_SRC} alt="edit section"/>
            </button>
        )
    );

    const renderTitle = () => {
        if (!isSolutionDraft) return solution.title;
        if (!isSolutionDraftTitleFormOpen) return `[DRAFT] ${solution.title}`
        return null;
    }


    if (!solution) return <p>Loading solution details...</p>;

    return (
        <section className="solution-overview-section">
            <div className="solution-header">
                <h2 className="solution-title">
                    {renderTitle()}

                    {isSolutionDraft && renderEditButton(isSolutionDraftTitleFormOpen, handleTitleEditButton, "", {
                        alignSelf: "start",
                        margin: "0 15px",
                        paddingLeft: "9px",
                        paddingRight: "12px",
                        height: "30px"
                    })}

                    {isSolutionDraftTitleFormOpen && (
                        <div className="draft-form" style={{width: "30vw", marginTop: "-20px"}}>{/* Warning: Class referenced in handleBrowserNavigation for DOM checks. Changes need to be synchronized. */}
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

                <button className="discussion-space-button" onClick={onToggleDiscussionSpace} disabled={isSolutionDraft}>Discussion Space</button>

                <div ref={metaRef} className="meta-button-container">
                    <button className={`solution-meta-button ${showMeta ? "active" : ""}`} onClick={handleMetaButtonClick}>i</button>
                    {showMeta && (
                        <div className="solution-overview-meta">
                            <span className="proposed-by">Proposed by: {solution.proposedBy.username}</span>
                            <span className="created-at">Created at: {isSolutionDraft ? "[unpublished]" : new Date(solution.createdAt).toLocaleDateString()}</span>
                            <span className="updated-at">Last Updated: {isSolutionDraft ? "[unpublished]" : new Date(solution.updatedAt).toLocaleDateString()}</span>
                        </div>
                    )}
                </div>
            </div>

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