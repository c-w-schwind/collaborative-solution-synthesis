import './Consideration.css';
import ConsiderationCard from './ConsiderationCard';
import {useCallback, useEffect, useState} from "react";
import ConsiderationInput from "./ConsiderationInput";

const ConsiderationsList = ({considerations: initialConsiderations, onSuccessfulSubmit, parentType, parentNumber}) => {
    const [considerations, setConsiderations] = useState(initialConsiderations);
    const [isFormActive, setIsFormActive] = useState(false);
    const stances = Object.entries(considerations);

    useEffect(() => {
        setConsiderations(initialConsiderations);
    }, [initialConsiderations]);

    const handleToggleConsiderationForm = () => {
        setIsFormActive(prevState => !prevState);
    };

    return (
        <div className="solution-details-list-container">
            <h3 className="solution-details-list-container-title">Considerations</h3>

            {stances.length > 0 && stances.map(([stance, stanceSet]) => {
                return (<div key={stance} className={`consideration-container ${stance}`}>
                    <h3 className="solution-details-list-container-title">{stance[0].toUpperCase() + stance.slice(1)}</h3>
                    {stanceSet.length > 0 ? (
                        <div className="solution-details-list">
                            {stanceSet.map(consideration => (
                                <ConsiderationCard
                                    key={consideration._id}
                                    consideration={consideration}
                                />
                            ))}
                        </div>
                    ) : (
                        <p>No "{stance}" considerations yet.</p>
                    )}
                </div>)
            })}

            <div className="solution-details-add-card-button-container">
                <button className={!isFormActive ? "solution-details-add-card-button" : "solution-element-action-button--close"}
                        onClick={handleToggleConsiderationForm}>{!isFormActive ? "Add Consideration" : "X"}</button>
                {isFormActive && <ConsiderationInput
                    onSuccessfulSubmit={() => {handleToggleConsiderationForm(); onSuccessfulSubmit();}}
                    parentType={parentType}
                    parentNumber={parentNumber}
                />
                }
            </div>
        </div>
    );
};

export default ConsiderationsList;