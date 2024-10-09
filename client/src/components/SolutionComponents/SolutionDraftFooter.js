import "./SolutionDraftFooter.css";
import {useEffect, useState} from "react";
import {useLocation} from "react-router-dom";
import {useLayout} from "../../context/LayoutContext";


const SolutionDraftFooter = ({onDiscardDraft, onSubmitDraft}) => {
    const [isHidden, setIsHidden] = useState(true);
    const [isFooterDisabled, setIsFooterDisabled] = useState(false);
    const location = useLocation();
    const {scrollbarWidth} = useLayout();

    useEffect(() => {
        // requestAnimationFrame ensures footer animation on component mount
        requestAnimationFrame(() => {
            const isElementPath = location.pathname.split("/").includes("element");
            setIsHidden(isElementPath);
            isElementPath ? setTimeout(() => setIsFooterDisabled(true), 300) : setIsFooterDisabled(false);
        });
    }, [location.pathname]);


    return (
        <div className="page-footer" style={isHidden ? {transition: "all 0.2s ease-in", bottom: "-100px"} : {transition: "all 0.5s ease-out"}}>
            <div className="page-footer-content" style={{marginRight: `${scrollbarWidth || 0}px`}}>
                <h2 className="footer-heading" style={{marginLeft: "30px"}}>Private Solution Draft</h2>
                <div className="footer-button-section" style={{marginRight: "30px"}}>
                    <button className="action-button action-button--discard-draft" onClick={onDiscardDraft} disabled={isFooterDisabled}>Discard Draft</button>
                    <button className="action-button action-button--submit-draft" onClick={onSubmitDraft} disabled={isFooterDisabled}>Submit Proposal</button>
                    <button className="info-button info-button--footer" disabled={isHidden}>i</button>
                </div>
            </div>
        </div>
    );
};

export default SolutionDraftFooter;