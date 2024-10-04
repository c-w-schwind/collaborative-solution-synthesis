import SolutionElementCard from "./SolutionElementCard.js";
import SolutionElementInput from "./SolutionElementInput";
import {useNavigate} from "react-router-dom";
import {useCallback} from "react";
import {useGlobal} from "../../context/GlobalContext";


const SolutionElementList = ({elements, elementDrafts, onToggleDiscussionSpace, isDiscussionSpaceOpen, parentNumber}) => {
    const navigate = useNavigate();
    const {isSolutionDraft} = useGlobal();

    const handleSubmit = useCallback((elementProposal) => {
        navigate(`element/${elementProposal.elementNumber}`);
    }, [navigate]);

    return (
        <div className="solution-details-list-container">
            <h3 className="solution-details-list-container-title">Solution Elements</h3>
            {(elements.length > 0 || elementDrafts.length > 0) ? (
                <div>
                    <div className="solution-details-list">
                        {elements.map(element => (
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

                    {elementDrafts.length > 0 && <div className={`solution-details-list ${!isSolutionDraft ? "draft-list-container" : ""}`}>
                        {!isSolutionDraft && <h3 className="solution-details-list-container-title" style={{paddingTop: "8px"}}>Your Private Draft{elementDrafts.length > 1 ? "s" : ""}</h3>}
                        {elementDrafts.map(draft => (
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