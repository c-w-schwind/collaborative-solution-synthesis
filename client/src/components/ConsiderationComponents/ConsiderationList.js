import "./ConsiderationList.css";
import ConsiderationCard from "./ConsiderationCard";
import {useEffect, useState} from "react";
import ConsiderationInput from "./ConsiderationInput";


const ConsiderationList = ({considerations: initialConsiderations, parentType, parentNumber, parentVersionNumber, onSuccessfulSubmit, entityType, scrollContainerRef = null}) => {
    const [considerations, setConsiderations] = useState(initialConsiderations);
    const [visibility, setVisibility] = useState({Pro: true, Con: true, Neutral: true});

    const stances = Object.entries(considerations);
    const isComparisonSolution = entityType === "ComparisonSolution";
    const isComparisonElement = entityType === "ComparisonElement";


    useEffect(() => {
        setConsiderations(initialConsiderations);
    }, [initialConsiderations]);


    const toggleVisibility = (stance) => {
        setVisibility(prevState => ({...prevState, [stance]: !prevState[stance]}));
    };

    const handleSuccessfulSubmit = (newConsideration) => {
        setConsiderations(prev => ({
            ...prev,
            [newConsideration.stance]: [...prev[newConsideration.stance], newConsideration]
        }));
        onSuccessfulSubmit();
    }


    return (
        <div className="solution-details-list-container">
            <h3 className="solution-details-list-container-title">Considerations</h3>

            {stances.length > 0 && stances.map(([stance, stanceSet]) => (
                    <div key={stance} className={`consideration-container ${stance.toLowerCase()}`}>
                        <div className="consideration-header">
                            <h3 className="consideration-header-title">
                                {stance + (visibility[stance] ? "" : ` (${stanceSet.length})`)}
                            </h3>
                            {stanceSet.length > 0 && <button
                                className="consideration-header-toggle"
                                onClick={() => toggleVisibility(stance)}
                            >
                                {visibility[stance] ? "Hide" : `Show [${stanceSet.length}]`}
                            </button>}
                        </div>
                        {visibility[stance] && (stanceSet.length > 0 ? (
                            <div className="consideration-list">
                                {stanceSet.map(consideration => (
                                    <ConsiderationCard
                                        key={consideration._id}
                                        considerationData={consideration}
                                        parentType={parentType}
                                        parentNumber={parentNumber}
                                        parentVersionNumber={parentVersionNumber}
                                        scrollContainerRef={scrollContainerRef}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="solution-overview-section-text">No "{stance}" considerations yet.</p>
                        ))}
                    </div>
                )
            )}
            {(!isComparisonSolution && !isComparisonElement) ? (
                <ConsiderationInput
                    onSuccessfulSubmit={handleSuccessfulSubmit}
                    parentType={parentType}
                    parentNumber={parentNumber}
                    parentVersionNumber={parentVersionNumber}
                    considerationFormId={"generalConsiderationForm"}
                />
            ) : (
                <div className="solution-overview-section"></div>
            )}
        </div>
    );
};

export default ConsiderationList;