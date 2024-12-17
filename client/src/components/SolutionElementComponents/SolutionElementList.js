import {useCallback, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useGlobal} from "../../context/GlobalContext";
import SolutionElementCard from "../Cards/SolutionElementCard.js";
import SolutionElementInput from "./SolutionElementInput";


const SolutionElementList = ({elements, elementDrafts, entityType, onToggleDiscussionSpace, onToggleComparison, currentSidePanelType, parentSolutionNumber, isUserAuthor, isPublicChangeProposal}) => {
    const [localElements, setLocalElements] = useState(elements);
    const [localElementDrafts, setLocalElementDrafts] = useState(elementDrafts);

    const {isSolutionDraft, isSolutionCP, elementListChange, setElementListChange} = useGlobal();
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
            const {changeType, elementNumber, versionNumber, title, overview, changeSummary} = elementListChange;

            const applyUpdates = (element) => ({
                ...element, ...(title && {title}), ...(overview && {overview}), ...(changeSummary && {changeSummary})
            });

            if (changeType === "delete") {
                setLocalElements(prevElements => prevElements
                    .filter(el => !(el.elementNumber === elementNumber && el.versionNumber === versionNumber))
                    .map(el => ({
                        ...el,
                        changeProposals: el.changeProposals
                            ? el.changeProposals.filter(proposal => !(proposal.elementNumber === elementNumber && proposal.versionNumber === versionNumber))
                            : []
                    }))
                );
                setLocalElementDrafts(prevElementDrafts => prevElementDrafts.filter(draft => !(draft.elementNumber === elementNumber && draft.versionNumber === versionNumber)));
            } else if (changeType === "update") {
                setLocalElementDrafts(prevElementDrafts => prevElementDrafts.map(draft =>
                    (draft.elementNumber === elementNumber && draft.versionNumber === versionNumber) ? applyUpdates(draft) : draft
                ));
                setLocalElements(prevElements => prevElements.map(el => {
                    if (el.elementNumber === elementNumber && el.versionNumber === versionNumber) {
                        return applyUpdates(el);
                    }
                    if (el.changeProposals) {
                        return {
                            ...el,
                            changeProposals: el.changeProposals.map(proposal =>
                                (proposal.elementNumber === elementNumber && proposal.versionNumber === versionNumber) ? applyUpdates(proposal) : proposal
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
        navigate(`element/${newElement.elementNumber}/${newElement.versionNumber}`, {state: {fromCreation: true}});
    }, [navigate]);

    const shouldAllowNewElementProposals = !isComparisonSolution && !isSolutionCP && (
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
                            !(isSolutionCP && !isComparisonSolution && element.status === "under_review") && <div key={element._id}>
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
                                            !(isSolutionCP && !isComparisonSolution && proposal.status === "under_review") &&
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

                    {(!isSolutionCP || isComparisonSolution) && localElementDrafts.length > 0 && <div className={`solution-details-list ${!isSolutionDraft || isComparisonSolution ? "draft-list-container" : ""}`}>
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
                parentSolutionNumber={parentSolutionNumber}
            />}
            {(isComparisonSolution || isSolutionCP) && <div className="solution-overview-section"></div>}
        </div>
    );
};

export default SolutionElementList;