import "./ConsiderationList.css";
import ConsiderationCard from "./ConsiderationCard";
import {useEffect, useState} from "react";
import ConsiderationInput from "./ConsiderationInput";
import {useGlobal} from "../../context/GlobalContext";

const ConsiderationList = ({considerations: initialConsiderations, parentType, parentNumber}) => {
    const [considerations, setConsiderations] = useState(initialConsiderations);
    const [visibility, setVisibility] = useState({Pro: true, Con: true, Neutral: true});

    const stances = Object.entries(considerations);

    const {requestSolutionRefetch} = useGlobal();

    useEffect(() => {
        setConsiderations(initialConsiderations);
    }, [initialConsiderations]);

    /*const fetchConsiderations = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/considerations/${parentType}/${parentNumber}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setConsiderations(data);
        } catch (err) {
            console.error("Failed to fetch considerations:", err);
        }
    }, [parentType, parentNumber]);*/

    const toggleVisibility = (stance) => {
        setVisibility(prevState => ({...prevState, [stance]: !prevState[stance]}));
    };

    const handleSuccessfulSubmit = (newConsideration) => {
        setConsiderations(prev => ({
            ...prev,
            [newConsideration.stance]: [...prev[newConsideration.stance], newConsideration]
        }));
        requestSolutionRefetch();
    }

    return (
        <div className="solution-details-list-container">
            <h3 className="solution-details-list-container-title">Considerations</h3>

            {stances.length > 0 && stances.map(([stance, stanceSet]) => {
                return (
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
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="solution-overview-section-text">No "{stance}" considerations yet.</p>
                        ))}
                    </div>
                )
            })}
            <ConsiderationInput
                onSuccessfulSubmit={handleSuccessfulSubmit}
                parentType={parentType}
                parentNumber={parentNumber}
                considerationFormId={"generalConsiderationForm"}
            />
        </div>
    );
};

export default ConsiderationList;