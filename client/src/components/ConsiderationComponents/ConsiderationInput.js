import {useEffect, useRef, useState} from "react";
import GenericForm from "../Forms/GenericForm";
import {useFormData} from "../../context/FormDataContext";
import {formConfigurations} from "../Forms/formConfigurations";
import formSubmissionService from "../Forms/formSubmissionService";

function ConsiderationInput({onSuccessfulSubmit, parentType, parentNumber, considerationFormId, existingData}) {
    // Enables a smooth closing transition by delaying the form's disappearance
    const [renderConsiderationForm, setRenderConsiderationForm] = useState(false);
    const [isConsiderationFormOpen, setIsConsiderationFormOpen] = useState(false);

    const {considerationFormData, setConsiderationFormData, openedConsiderationFormId, toggleConsiderationForm} = useFormData();

    const inputStance = considerationFormData.stance;
    const considerationFormContainerRef = useRef(null);

    const considerationConfig = {
        ...formConfigurations.considerationForm,
        description: formConfigurations.considerationForm.descriptions[parentType],
    };


    useEffect(() => {
        existingData && setConsiderationFormData(existingData);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Opens form in current instance if instance ID matches context ID
    useEffect(() => {
        setIsConsiderationFormOpen(openedConsiderationFormId === considerationFormId);
    }, [openedConsiderationFormId, considerationFormId]);

    // Toggling form animations
    useEffect(() => {
        let timeoutId, animationId;
        if (considerationFormContainerRef.current) {
            if (isConsiderationFormOpen) {
                setRenderConsiderationForm(true);
                timeoutId = setTimeout(() => {
                    animationId = requestAnimationFrame(() => {
                        considerationFormContainerRef.current.style.height = `${considerationFormContainerRef.current.scrollHeight}px`;
                        considerationFormContainerRef.current.style.marginTop = "-50px";
                    });
                });
            } else {
                considerationFormContainerRef.current.style.height = "0px";
                considerationFormContainerRef.current.style.marginTop = "0px";
                timeoutId = setTimeout(() => {
                    setRenderConsiderationForm(false);
                }, 300); // Delaying disappearance until after animation finishes
            }
        }
        return () => {
            clearTimeout(timeoutId);
            cancelAnimationFrame(animationId);
        };
    }, [isConsiderationFormOpen]);

    const submitConsiderationPost = async (formData) => {
        const postData = {...formData, parentType, parentNumber};
        const method = existingData ? "PUT" : "POST";
        const url = existingData ? `considerations/${openedConsiderationFormId}` : "considerations";

        await formSubmissionService(url, postData, "consideration", onSuccessfulSubmit, method);
        toggleConsiderationForm(considerationFormId, null, false);
    };

    return (
        <div className="solution-details-add-card-button-container"> {/* Warning: Class referenced in handleBrowserNavigation for DOM checks. Changes need to be synchronized. */}
            <button
                className="solution-details-add-card-button"
                onClick={() => toggleConsiderationForm(considerationFormId, considerationFormContainerRef)}
                style={isConsiderationFormOpen
                    ? {opacity: "0", cursor: "default", transition: "all 0.1s linear", pointerEvents: "none"}
                    : {opacity: "1", transition: "all 0.3s ease-in", pointerEvents: "auto"}
                }
                disabled={isConsiderationFormOpen}
            >
                Add Consideration
            </button>
            <div className="animated-toggle-section" ref={considerationFormContainerRef}>
                {renderConsiderationForm &&
                    <div className={`consideration-container ${inputStance.toLowerCase()}`}
                         style={considerationFormId === "generalConsiderationForm"
                             ? {padding: "15px 25px"}
                             : {padding: "15px 25px", margin: "10px 10px 20px 10px"}}
                    >
                        <div className="form-header">
                            <h3 className="form-title">{(existingData ? "Edit " : "") + formConfigurations.considerationForm.title}</h3>
                            <button className="action-button--close" onClick={() => toggleConsiderationForm(considerationFormId)}>X</button>
                        </div>
                        <GenericForm
                            onSubmit={submitConsiderationPost}
                            config={considerationConfig}
                            formData={considerationFormData}
                            setFormData={setConsiderationFormData}
                        />
                    </div>
                }
            </div>
        </div>
    );
}

export default ConsiderationInput;