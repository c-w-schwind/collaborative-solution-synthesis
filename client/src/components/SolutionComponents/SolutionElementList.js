import SolutionElementCard from "./SolutionElementCard.js";
import SolutionElementInput from "./SolutionElementInput";
import {useEffect, useRef, useState} from "react";
import {useFormData} from "../../context/FormDataContext";
import {useToasts} from "../../context/ToastContext";


const SolutionElementList = ({elements: initialElements, onToggleDiscussionSpace, isDiscussionSpaceOpen, parentNumber}) => {
    const [elements, setElements] = useState(initialElements);
    const [renderElementForm, setRenderElementForm] = useState(false);
    const {toggleElementForm, isElementFormOpen} = useFormData();
    const {addToast} = useToasts();

    const elementFormContainerRef = useRef(null);

    useEffect(() => {
        setElements(initialElements);
    }, [initialElements]);


    useEffect(() => {
        let timeoutId, animationId;
        if (elementFormContainerRef.current) {
            if (isElementFormOpen) {
                setRenderElementForm(true);
                timeoutId = setTimeout(() => {
                    animationId = requestAnimationFrame(() => {
                        elementFormContainerRef.current.style.height = `${elementFormContainerRef.current.scrollHeight}px`;
                        elementFormContainerRef.current.style.marginTop = "-70px";
                    });
                }, 10); // Necessary delay to ensure form appears in Safari. See fallback check.
            } else {
                elementFormContainerRef.current.style.height = "0px";
                elementFormContainerRef.current.style.marginTop = "0px";
                timeoutId = setTimeout(() => {
                    setRenderElementForm(false);
                }, 300);
            }
        }
        return () => {
            clearTimeout(timeoutId);
            cancelAnimationFrame(animationId);
        };
    }, [elements, isElementFormOpen]);

    // Fallback check to ensure form visibility
    useEffect(() => {
        if (isElementFormOpen && renderElementForm) {
            const fallbackTimeout = setTimeout(() => {
                const formHeight = elementFormContainerRef.current.offsetHeight;
                if (formHeight < 50) {
                    addToast("An error occurred. Please try opening the form again. If the problem persists, please contact the developer.", 10000);
                    toggleElementForm(false);
                    setRenderElementForm(false);
                }
            }, 500); // Above animation duration so check happens after animation

            return () => clearTimeout(fallbackTimeout);
        }
    }, [isElementFormOpen, renderElementForm, toggleElementForm]);

    const handleSubmit = (elementProposal) => {
        setElements(prev => [...prev, elementProposal]);
        toggleElementForm(false);
    };

    return (
        <div className="solution-details-list-container">
            <h3 className="solution-details-list-container-title">Solution Elements</h3>
            <div className="solution-details-list">
                {elements.map(element => (
                    <SolutionElementCard
                        key={element._id}
                        element={element}
                        onToggleDiscussionSpace={onToggleDiscussionSpace}
                        isDiscussionSpaceOpen={isDiscussionSpaceOpen}
                    />
                ))}
            </div>
            <div className="solution-details-add-card-button-container">
                <button
                    className="solution-details-add-card-button"
                    onClick={toggleElementForm}
                    style={isElementFormOpen
                        ? {opacity: "0", cursor: "default", transition: "all 0.1s linear", pointerEvents: "none"}
                        : {opacity: "1", transition: "all 0.3s ease-in", pointerEvents: "auto"}
                    }
                    disabled={isElementFormOpen}
                >
                    Propose New Element
                </button>
                <div className="comment-section-animated" ref={elementFormContainerRef}>    {/* TODO change class*/}
                    {renderElementForm && <div className="form-container">
                        <button className="solution-element-action-button--close" onClick={toggleElementForm}>X</button>
                        <SolutionElementInput
                            onSuccessfulSubmit={handleSubmit}
                            parentNumber={parentNumber}
                        />
                    </div>}
                </div>
            </div>
        </div>
    );
};

export default SolutionElementList;