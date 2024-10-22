import {useCallback, useEffect, useState} from "react";
import SolutionElementCard from "./SolutionElementCard.js";
import SolutionElementInput from "./SolutionElementInput";
import {useNavigate} from "react-router-dom";
import {useGlobal} from "../../context/GlobalContext";


const SolutionElementList = ({elements, elementDrafts, onToggleDiscussionSpace, isDiscussionSpaceOpen, parentNumber}) => {
    const [localElements, setLocalElements] = useState(elements);
    const [localElementDrafts, setLocalElementDrafts] = useState(elementDrafts);

    const {isSolutionDraft, elementListChange, setElementListChange} = useGlobal();
    const navigate = useNavigate();

    useEffect(() => {
        setLocalElements(elements);
    }, [elements]);

    useEffect(() => {
        setLocalElementDrafts(elementDrafts);
    }, [elementDrafts]);

    // Handle element list updates based on outside element draft changes (from modal)
    useEffect(() => {
        if (elementListChange) {
            const {changeType, elementNumber, title, overview, change_summary} = elementListChange;

            if (changeType === "delete") {
                setLocalElements(prevElements => prevElements.filter(el => el.elementNumber !== elementNumber));
                setLocalElementDrafts(prevElementDrafts => prevElementDrafts.filter(draft => draft.elementNumber !== elementNumber));
            } else if (changeType === "update") {
                setLocalElementDrafts(prevElementDrafts => (
                    prevElementDrafts.map(el => el.elementNumber === elementNumber
                        ? {
                            ...el,
                            ...(title ? {title} : {}),
                            ...(overview ? {overview} : {}),
                            ...(change_summary ? {change_summary} : {})
                        } : el
                    )
                ));
            }
            setElementListChange(null);
        }
    }, [elementListChange, setElementListChange]);

    const handleSubmit = useCallback((newElement) => {
        setLocalElementDrafts(prevElements => [...prevElements, newElement]);
        navigate(`element/${newElement.elementNumber}`, {state: {fromCreation: true}});
    }, [navigate]);

    return (
        <div className="solution-details-list-container">
            <h3 className="solution-details-list-container-title">Solution Elements</h3>
            {(localElements.length > 0 || localElementDrafts.length > 0) ? (
                <div>
                    <div className="solution-details-list">
                        {localElements.map(element => (
                            <div key={element._id}>
                                <SolutionElementCard
                                    element={element}
                                    onToggleDiscussionSpace={onToggleDiscussionSpace}
                                    isDiscussionSpaceOpen={isDiscussionSpaceOpen}
                                />
                                {element.changeProposals && element.changeProposals.length > 0 && (
                                    <div>
                                        {element.changeProposals.map(proposal => (
                                            <SolutionElementCard
                                                key={proposal._id}
                                                element={proposal}
                                                onToggleDiscussionSpace={onToggleDiscussionSpace}
                                                isDiscussionSpaceOpen={isDiscussionSpaceOpen}
                                                isChangeProposal={true}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {localElementDrafts.length > 0 && <div className={`solution-details-list ${!isSolutionDraft ? "draft-list-container" : ""}`}>
                        {!isSolutionDraft && <h3 className="solution-details-list-container-title" style={{paddingTop: "8px"}}>Your Private Draft{localElementDrafts.length > 1 ? "s" : ""}</h3>}
                        {localElementDrafts.map(draft => (
                            <SolutionElementCard
                                key={draft._id}
                                element={draft}
                                onToggleDiscussionSpace={onToggleDiscussionSpace}
                                isDiscussionSpaceOpen={isDiscussionSpaceOpen}
                            />
                        ))}
                    </div>}
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