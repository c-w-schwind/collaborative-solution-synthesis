import SolutionElementCard from "./SolutionElementCard.js";
import SolutionElementInput from "./SolutionElementInput";
import {useEffect, useState} from "react";
import {useFormData} from "../../context/FormDataContext";


const SolutionElementsList = ({elements: initialElements, onToggleDiscussionSpace, isDiscussionSpaceOpen, parentNumber}) => {
    const [elements, setElements] = useState(initialElements);
    const {toggleElementForm, isElementFormOpen} = useFormData();

    useEffect(() => {
        setElements(initialElements);
    }, [initialElements]);

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
                <div className={isElementFormOpen ? "form-container" : ""}>
                    <button
                        className={!isElementFormOpen
                            ? "solution-details-add-card-button"
                            : "solution-element-action-button--close"}
                        onClick={toggleElementForm}
                    >
                        {!isElementFormOpen ? "Propose New Element" : "X"}
                    </button>
                    {isElementFormOpen && <SolutionElementInput
                        onSuccessfulSubmit={handleSubmit}
                        parentNumber={parentNumber}
                    />}
                </div>
            </div>
        </div>
    );
};

export default SolutionElementsList;