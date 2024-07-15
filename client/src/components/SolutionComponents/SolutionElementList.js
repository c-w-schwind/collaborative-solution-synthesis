import SolutionElementCard from "./SolutionElementCard.js";
import SolutionElementInput from "./SolutionElementInput";
import {useEffect, useState} from "react";


const SolutionElementList = ({elements: initialElements, onToggleDiscussionSpace, isDiscussionSpaceOpen, parentNumber}) => {
    const [elements, setElements] = useState(initialElements);

    useEffect(() => {
        setElements(initialElements);
    }, [initialElements]);

    const handleSubmit = (elementProposal) => {
        setElements(prev => [...prev, elementProposal]);
    };

    return (
        <div className="solution-details-list-container">
            <h3 className="solution-details-list-container-title">Solution Elements</h3>
            {elements.length > 0 ? (
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
            ) : (
                <div>No solution elements proposed yet.</div>
            )}
            <SolutionElementInput
                onSuccessfulSubmit={handleSubmit}
                parentNumber={parentNumber}
            />
        </div>
    );
};

export default SolutionElementList;