import "./ConsiderationList.css";
import ConsiderationCard from "./ConsiderationCard";
import {/*useCallback,*/ useEffect, useRef, useState} from "react";
import ConsiderationInput from "./ConsiderationInput";
import {useFormData} from "../../context/FormDataContext";

const ConsiderationList = ({considerations: initialConsiderations, parentType, parentNumber}) => {
    const [considerations, setConsiderations] = useState(initialConsiderations);
    const [isConsiderationFormOpen, setIsConsiderationFormOpen] = useState(false);
    const [renderConsiderationForm, setRenderConsiderationForm] = useState(false);
    const [visibility, setVisibility] = useState({Pro: true, Con: true, Neutral: true});

    const stances = Object.entries(considerations);
    const {considerationFormData, toggleConsiderationForm, openedConsiderationFormId} = useFormData();
    const inputStance = considerationFormData.stance;

    const considerationFormContainerRef = useRef(null);

    useEffect(() => {
        setConsiderations(initialConsiderations);
    }, [initialConsiderations]);

    useEffect(() => {
        setIsConsiderationFormOpen(openedConsiderationFormId === "generalConsiderationForm");
    }, [openedConsiderationFormId]);

    useEffect(() => {
        let timeoutId, animationId;
        if (considerationFormContainerRef.current) {
            if (isConsiderationFormOpen) {
                setRenderConsiderationForm(true);
                timeoutId = setTimeout(() => {
                    animationId = requestAnimationFrame(() => {
                        considerationFormContainerRef.current.style.height = `${considerationFormContainerRef.current.scrollHeight}px`;
                        considerationFormContainerRef.current.style.marginTop = "-50px";
                    });
                });
            } else {
                considerationFormContainerRef.current.style.height = "0px";
                considerationFormContainerRef.current.style.marginTop = "0px";
                timeoutId = setTimeout(() => {
                    setRenderConsiderationForm(false);
                }, 300);
            }
        }
        return () => {
            clearTimeout(timeoutId);
            cancelAnimationFrame(animationId);
        };
    }, [considerations, isConsiderationFormOpen]);

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
                            <p>No "{stance}" considerations yet.</p>
                        ))}
                    </div>
                )
            })}
            <div className="solution-details-add-card-button-container">
                <button
                    className="solution-details-add-card-button"
                    onClick={() => toggleConsiderationForm("generalConsiderationForm")}
                    style={isConsiderationFormOpen
                        ? {opacity: "0", cursor: "default", transition: "all 0.1s linear", pointerEvents: "none"}
                        : {opacity: "1", transition: "all 0.3s ease-in", pointerEvents: "auto"}
                    }
                    disabled={isConsiderationFormOpen}
                >
                    Add Consideration
                </button>
                <div className="comment-section-animated" ref={considerationFormContainerRef}>
                    {renderConsiderationForm && <div className={`consideration-container ${inputStance.toLowerCase()}`} style={{padding: "15px 25px"}}>
                        <button className="solution-element-action-button--close" onClick={() => toggleConsiderationForm("generalConsiderationForm")}>X</button>
                        <ConsiderationInput
                            onSuccessfulSubmit={handleSuccessfulSubmit}
                            parentType={parentType}
                            parentNumber={parentNumber}
                        />
                    </div>}
                </div>
            </div>
        </div>
    );
};

export default ConsiderationList;