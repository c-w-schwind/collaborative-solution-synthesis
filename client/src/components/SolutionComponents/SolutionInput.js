import GenericForm from "../Forms/GenericForm";
import {formConfigurations} from "../Forms/formConfigurations";
import {useFormData} from "../../context/FormDataContext";
import formSubmissionService from "../Forms/formSubmissionService";
import {useNavigate} from "react-router-dom";
import {useToasts} from "../../context/ToastContext";
import {useEffect, useRef, useState} from "react";

const SolutionInput = () => {
    // Enables a smooth closing transition by delaying the form's disappearance
    const [renderSolutionForm, setRenderSolutionForm] = useState(false);

    const {solutionFormData, setSolutionFormData, toggleSolutionForm, isSolutionFormOpen} = useFormData();
    const {addToast} = useToasts();

    const solutionFormContainerRef = useRef(null);
    const navigate = useNavigate();


    // Toggling form animations
    useEffect(() => {
        let timeoutId, animationId;
        if (solutionFormContainerRef.current) {
            if (isSolutionFormOpen) {
                setRenderSolutionForm(true);
                timeoutId = setTimeout(() => {
                    animationId = requestAnimationFrame(() => {
                        solutionFormContainerRef.current.style.height = `${solutionFormContainerRef.current.scrollHeight}px`;
                        solutionFormContainerRef.current.style.marginTop = "-180px";
                    });
                }, 10); // Ensures form appears in Safari. See fallback check below.
            } else {
                solutionFormContainerRef.current.style.height = "0px";
                solutionFormContainerRef.current.style.marginTop = "0px";
                timeoutId = setTimeout(() => {
                    setRenderSolutionForm(false);
                }, 300); // Delaying disappearance until after animation finishes
            }
        }
        // Fallback check to ensure form visibility
        if (isSolutionFormOpen && renderSolutionForm) {
            const fallbackTimeout = setTimeout(() => {
                const formHeight = solutionFormContainerRef.current.offsetHeight;
                if (formHeight < 50) {
                    addToast("An error occurred. Please try opening the form again. If the problem persists, please contact the developer.", 10000);
                    toggleSolutionForm(false);
                    setRenderSolutionForm(false);
                }
            }, 500); // Above the animation duration, so check is done after animation finishes

            return () => clearTimeout(fallbackTimeout);
        }
        return () => {
            clearTimeout(timeoutId);
            cancelAnimationFrame(animationId);
        };
    }, [isSolutionFormOpen, renderSolutionForm, toggleSolutionForm, addToast]);


    const submitSolution = async (formData) => {
        const onSuccessfulSubmit = (newSolution) => {
            addToast(`New solution "${newSolution.title}" has been successfully created.`, 6000);
            navigate(`${newSolution.solutionNumber}`);
            toggleSolutionForm(false);
        }

        await formSubmissionService("solutions", formData, "solution", onSuccessfulSubmit);
    }


    return (
        <div className="solution-input-container" style={isSolutionFormOpen ? {backgroundColor: "#fff", maxWidth: "900px", padding: "40px 50px"} : {}}> {/* Warning: Class referenced in handleBrowserNavigation for DOM checks. Changes need to be synchronized.  */}
            <div
                className="no-solutions-call-to-action"
                style={isSolutionFormOpen
                    ? {opacity: "0", transform: "translateY(-200px)", transition: "opacity 0.2s ease-out, transform 0.4s ease-in"}
                    : {opacity: "1", transform: "translateY(0px)", transition: "opacity 0.4s ease-in, transform 0.3s ease-out"}
                }
            >
                Share your own solution and collaborate with the community<br/> to refine and explore new possibilities.
            </div>

            <button
                className="solution-action-button"
                onClick={() => toggleSolutionForm(true, solutionFormContainerRef)}
                style={isSolutionFormOpen
                    ? {opacity: "0", cursor: "default", transition: "all 0.1s linear", pointerEvents: "none"}
                    : {opacity: "1", transition: "all 0.4s ease-in", pointerEvents: "auto"}
                }
                disabled={isSolutionFormOpen}
            >
                Add new Solution!
            </button>

            <div className="animated-toggle-section" ref={solutionFormContainerRef}>
                {renderSolutionForm && <div className="form-container">
                    <button className="solution-element-action-button--close" onClick={() => toggleSolutionForm(true)}>X</button>
                    <GenericForm
                        onSubmit={submitSolution}
                        config={formConfigurations.solutionForm}
                        formData={solutionFormData}
                        setFormData={setSolutionFormData}
                    />
                </div>}
            </div>
        </div>
    );
}

export default SolutionInput;