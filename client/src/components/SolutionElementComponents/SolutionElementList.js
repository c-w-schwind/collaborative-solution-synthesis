import {useCallback, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useGlobal} from "../../context/GlobalContext";
import SolutionElementCard from "../Cards/SolutionElementCard.js";
import SolutionElementInput from "./SolutionElementInput";


const SolutionElementList = ({elements, elementDrafts, entityType, onToggleDiscussionSpace, onToggleComparison, currentSidePanelType, parentNumber, isUserAuthor, isPublicChangeProposal}) => {
    const [localElements, setLocalElements] = useState(elements);
    const [localElementDrafts, setLocalElementDrafts] = useState(elementDrafts);

    const {isSolutionDraft, elementListChange, setElementListChange} = useGlobal();
    const navigate = useNavigate();

    const isComparisonSolution = entityType === "ComparisonSolution";


    useEffect(() => {
        setLocalElements(elements);
    }, [elements]);

    useEffect(() => {
        setLocalElementDrafts(elementDrafts);
    }, [elementDrafts]);

    // Handle element list updates based on outside element draft changes (from modal)
    useEffect(() => {
        if (elementListChange) {
            const {changeType, elementNumber, title, overview, changeSummary} = elementListChange;

            const applyUpdates = (element) => ({
                ...element, ...(title && {title}), ...(overview && {overview}), ...(changeSummary && {changeSummary})
            });

            if (changeType === "delete") {
                setLocalElements(prevElements => prevElements
                    .filter(el => el.elementNumber !== elementNumber)
                    .map(el => ({
                        ...el,
                        changeProposals: el.changeProposals
                            ? el.changeProposals.filter(proposal => proposal.elementNumber !== elementNumber)
                            : []
                    }))
                );
                setLocalElementDrafts(prevElementDrafts => prevElementDrafts.filter(draft => draft.elementNumber !== elementNumber));
            } else if (changeType === "update") {
                setLocalElementDrafts(prevElementDrafts => prevElementDrafts.map(draft =>
                    draft.elementNumber === elementNumber ? applyUpdates(draft) : draft
                ));
                setLocalElements(prevElements => prevElements.map(el => {
                    if (el.elementNumber === elementNumber) {
                        return applyUpdates(el);
                    }
                    if (el.changeProposals) {
                        return {
                            ...el,
                            changeProposals: el.changeProposals.map(proposal =>
                                proposal.elementNumber === elementNumber ? applyUpdates(proposal) : proposal
                            )
                        };
                    }
                    return el;
                }));
            }
            setElementListChange(null);
        }
    }, [elementListChange, setElementListChange]);


    const handleSubmit = useCallback((newElement) => {
        setLocalElementDrafts(prevElements => [...prevElements, newElement]);
        navigate(`element/${newElement.elementNumber}`, {state: {fromCreation: true}});
    }, [navigate]);

    const shouldAllowNewElementProposals = !isComparisonSolution && (
        (isSolutionDraft && isUserAuthor) ||
        (!isSolutionDraft && !isPublicChangeProposal)
    );

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
                                    entityType={entityType}
                                    onToggleDiscussionSpace={onToggleDiscussionSpace}
                                    onToggleComparison={onToggleComparison}
                                    currentSidePanelType={currentSidePanelType}
                                />
                                {element.changeProposals && element.changeProposals.length > 0 && (
                                    <div>
                                        {element.changeProposals.map(proposal => (
                                            <SolutionElementCard
                                                key={proposal._id}
                                                element={proposal}
                                                entityType={entityType}
                                                onToggleDiscussionSpace={onToggleDiscussionSpace}
                                                onToggleComparison={onToggleComparison}
                                                currentSidePanelType={currentSidePanelType}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {localElementDrafts.length > 0 && <div className={`solution-details-list ${!isSolutionDraft || isComparisonSolution ? "draft-list-container" : ""}`}>
                        {(!isSolutionDraft || isComparisonSolution) && <h3 className="solution-details-list-container-title" style={{paddingTop: "8px"}}>Your Private Draft{localElementDrafts.length > 1 ? "s" : ""}</h3>}
                        {localElementDrafts.map(draft => (
                            <SolutionElementCard
                                key={draft._id}
                                element={draft}
                                entityType={entityType}
                                onToggleDiscussionSpace={onToggleDiscussionSpace}
                                onToggleComparison={onToggleComparison}
                                currentSidePanelType={currentSidePanelType}
                            />
                        ))}
                    </div>}
                </div>
            ) : (
                <div className="solution-overview-section-text">No solution elements proposed yet.</div>
            )}
            {shouldAllowNewElementProposals && <SolutionElementInput
                onSuccessfulSubmit={handleSubmit}
                parentNumber={parentNumber}
            />}
            {isComparisonSolution && <div className="solution-overview-section"></div>}
        </div>
    );
};

export default SolutionElementList;