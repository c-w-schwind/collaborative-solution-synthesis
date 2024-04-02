import './SolutionElementModal.css'
import ConsiderationsList from "../components/SolutionComponents/ConsiderationsList";
import {useEffect, useState} from "react";
import {useLocation, useNavigate, useParams} from "react-router-dom";


function SolutionElementModal() {
    const [solutionElement, setSolutionElement] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const {elementId} = useParams();

    useEffect(() => {
        const fetchSolutionElement = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/solutionElements/${elementId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                setSolutionElement(data.solutionElement);
            } catch (err) {
                console.error('Failed to fetch element:', err);
            }
        };

        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollbarWidth}px`;

        fetchSolutionElement();

        return () => {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        };
    }, [elementId]);

    const handleClosing = () => {
        setSolutionElement(null);
        location.state?.fromElementCard ? navigate(-1) : navigate("../..", {relative: "path"});
    };

    return (
        solutionElement !== null ? (
            <div className="overlay" onClick={handleClosing}>
                <div className="solution-element-container" onClick={(e) => e.stopPropagation()}>
                    <div className="solution-element-container-content">
                        <div className="solution-element-header">
                            <h2 style={{marginTop: 0}}>{solutionElement.title} ({solutionElement.elementType})</h2>
                            <button className="solution-element-close-button" aria-label="Close" onClick={handleClosing}>X</button>
                        </div>

                        <div className="solution-details-list-container">
                            <h3 className={"solution-details-list-container-title"}>Overview</h3>
                            <p>{solutionElement.overview}</p>
                        </div>

                        <div className="solution-details-list-container">
                            <h3 className="solution-details-list-container-title">Detailed Description</h3>
                            <p>{solutionElement.description}</p>
                        </div>

                        <ConsiderationsList considerations={solutionElement.considerations}/>
                    </div>
                </div>
            </div>
        ) : (
            <p>Loading Solution Element details...</p>
        )
    );
}

export default SolutionElementModal;