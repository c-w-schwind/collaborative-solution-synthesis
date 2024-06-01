import './Consideration.css';
import ConsiderationCard from './ConsiderationCard';
import {useCallback, useEffect, useState} from "react";
import ConsiderationInput from "./ConsiderationInput";
import {useFormData} from "../../context/FormDataContext";

const ConsiderationsList = ({considerations: initialConsiderations, parentType, parentNumber}) => {
    const [considerations, setConsiderations] = useState(initialConsiderations);
    const [isFormActive, setIsFormActive] = useState(false);
    const [visibility, setVisibility] = useState({pro: true, con: true, neutral: true});

    const stances = Object.entries(considerations);
    const inputStance = useFormData().considerationFormData.stance;

    useEffect(() => {
        setConsiderations(initialConsiderations);
    }, [initialConsiderations]);

    const fetchConsiderations = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/considerations/${parentType}/${parentNumber}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setConsiderations(data.considerations);
        } catch (err) {
            console.error('Failed to fetch considerations:', err);
        }
    }, [parentType, parentNumber]);

    const toggleConsiderationForm = () => {
        setIsFormActive(prevState => !prevState);
    };

    const toggleVisibility = (stance) => {
        setVisibility(prevState => ({...prevState, [stance]: !prevState[stance]}));
    };

    return (
        <div className="solution-details-list-container">
            <h3 className="solution-details-list-container-title">Considerations</h3>

            {stances.length > 0 && stances.map(([stance, stanceSet]) => {
                return (
                    <div key={stance} className={`consideration-container ${stance}`}>
                        <div className="consideration-header">
                            <h3 className="consideration-header-title">{stance[0].toUpperCase() + stance.slice(1) + (visibility[stance] ? "" : ` (${stanceSet.length})`)}</h3>
                            {stanceSet.length > 0 && <button className="consideration-header-toggle-button" onClick={() => toggleVisibility(stance)}>
                                {visibility[stance] ? "Hide" : `Show [${stanceSet.length}]`}
                            </button>}
                        </div>
                        {visibility[stance] && (stanceSet.length > 0 ? (
                            <div className="consideration-list">
                                {stanceSet.map(consideration => (
                                    <ConsiderationCard
                                        key={consideration._id}
                                        consideration={consideration}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p>No "{stance}" considerations yet.</p>
                        ))}
                    </div>
                )
            })}

            <div className="solution-details-add-card-button-container">
                <div className={!isFormActive ? "" : `consideration-container ${inputStance.toLowerCase()}`}>
                    <button className={!isFormActive ? "solution-details-add-card-button" : "solution-element-action-button--close"}
                            onClick={toggleConsiderationForm}>{!isFormActive ? "Add Consideration" : "X"}</button>
                    {isFormActive && <ConsiderationInput
                        onSuccessfulSubmit={() => {toggleConsiderationForm();fetchConsiderations();}}
                        parentType={parentType}
                        parentNumber={parentNumber}
                    />}
                </div>
            </div>
        </div>
    );
};

export default ConsiderationsList;