import GenericForm from "../Forms/GenericForm";
import {useFormData} from "../../context/FormDataContext";
import {formConfigurations} from "../Forms/formConfigurations";
import formSubmissionService from "../Forms/formSubmissionService";
import {useEffect, useRef, useState} from "react";
import {useToasts} from "../../context/ToastContext";
import {useLoading} from "../../context/LoadingContext";

const SolutionElementInput = ({onSuccessfulSubmit, parentSolutionNumber}) => {
    // Enables a smooth closing transition by delaying the form's disappearance
    const [renderElementForm, setRenderElementForm] = useState(false);

    const {elementFormData, setElementFormData, toggleElementForm, isElementFormOpen} = useFormData();
    const {addToast} = useToasts();
    const {showLoading, hideLoading} = useLoading();

    const elementFormContainerRef = useRef(null);


    // Toggling form animations
    useEffect(() => {
        let timeoutId, animationId;
        if (elementFormContainerRef.current) {
            if (isElementFormOpen) {
                setRenderElementForm(true);
                timeoutId = setTimeout(() => {
                    animationId = requestAnimationFrame(() => {
                        elementFormContainerRef.current.style.height = `${elementFormContainerRef.current.scrollHeight}px`;
                        elementFormContainerRef.current.style.marginTop = "-50px";
                    });
                }, 10); // Ensures form appears in Safari. See fallback check below.
            } else {
                elementFormContainerRef.current.style.height = "0px";
                elementFormContainerRef.current.style.marginTop = "0px";
                timeoutId = setTimeout(() => {
                    setRenderElementForm(false);
                }, 300); // Delaying disappearance until after animation finishes
            }
        }
        // Fallback check to ensure form visibility
        if (isElementFormOpen && renderElementForm) {
            const fallbackTimeout = setTimeout(() => {
                const formHeight = elementFormContainerRef.current.offsetHeight;
                if (formHeight < 50) {
                    addToast("An error occurred. Please try opening the form again. If the problem persists, please contact the developer.", 10000);
                    toggleElementForm(false);
                    setRenderElementForm(false);
                }
            }, 500); // Above animation duration so check is done after animation finishes

            return () => clearTimeout(fallbackTimeout);
        }
        return () => {
            clearTimeout(timeoutId);
            cancelAnimationFrame(animationId);
        };
    }, [isElementFormOpen, renderElementForm, toggleElementForm, addToast]);

    const submitElementProposal = async (formData) => {
        showLoading(`Creating New Element Draft\n"${formData.title}"`);
        const proposalData = {...formData, parentSolutionNumber};
        try {
            await formSubmissionService("solutionElements", proposalData, "solution element", onSuccessfulSubmit);
            toggleElementForm(false);
        } catch (error) {
            throw error;
        } finally {
            hideLoading();
        }
    };


    return (
        <div className="solution-details-add-card-button-container"> {/* Warning: Class referenced in handleBrowserNavigation for DOM checks. Changes need to be synchronized. */}
            <button
                className="solution-details-add-card-button"
                onClick={() => toggleElementForm(true, elementFormContainerRef)}
                style={isElementFormOpen
                    ? {opacity: "0", cursor: "default", transition: "all 0.1s linear", pointerEvents: "none"}
                    : {opacity: "1", transition: "all 0.3s ease-in", pointerEvents: "auto"}
                }
                disabled={isElementFormOpen}
            >
                Propose New Element
            </button>
            <div className="animated-toggle-section" ref={elementFormContainerRef}>
                {renderElementForm && <div className="form-container">
                    <div className="form-header">
                        <h3 className="form-title">{formConfigurations.elementForm.title}</h3>
                        <button className="action-button--close" onClick={() => toggleElementForm(true)}>X</button>
                    </div>

                    <GenericForm
                        onSubmit={submitElementProposal}
                        config={formConfigurations.elementForm}
                        formData={elementFormData}
                        setFormData={setElementFormData}
                    />
                </div>}
            </div>
        </div>
    );
};

export default SolutionElementInput;