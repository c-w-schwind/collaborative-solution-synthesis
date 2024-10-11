import "./SolutionDraftFooter.css";
import {useEffect, useState} from "react";
import {useLocation} from "react-router-dom";
import {useLayout} from "../../context/LayoutContext";
import useOutsideClick from "../../hooks/useOutsideClickHook";
import {DELETE_ICON_SRC, SUBMIT_ICON_SRC} from "../../constants";


const SolutionDraftFooter = ({onDiscardDraft, onSubmitDraft, onPublishSolution, solutionStatus}) => {
    const [isHidden, setIsHidden] = useState(true);
    const [isFooterDisabled, setIsFooterDisabled] = useState(false);
    const [isShowingInfo, setIsShowingInfo] = useState(false);

    const {scrollbarWidth, setIsOverlayActive} = useLayout();
    const location = useLocation();

    const infoRef = useOutsideClick(() => setIsShowingInfo(false));

    useEffect(() => {
        // requestAnimationFrame ensures footer animation on component mount
        requestAnimationFrame(() => {
            const isElementPath = location.pathname.split("/").includes("element");
            setIsHidden(isElementPath);
            if (isElementPath) {
                setTimeout(() => setIsFooterDisabled(true), 200);
            } else {
                setIsFooterDisabled(false);
            }
        });
    }, [location.pathname]);

    useEffect(() => {
        setIsOverlayActive(isShowingInfo);
    }, [isShowingInfo, setIsOverlayActive]);

    const handleInfoButtonClick = () => setIsShowingInfo(prev => !prev);

    return (
        <>
            <div className={`page-footer ${isHidden ? "hidden" : isShowingInfo ? "expanded" : ""}`}>
                <div ref={infoRef} className="page-footer-content" style={{marginRight: `${scrollbarWidth || 0}px`}}>

                    <div className="footer-top">
                        <h2 className="footer-heading">Private Solution Draft</h2>
                        <div className="footer-button-section">
                            <button className="action-button action-button--discard-draft" onClick={onDiscardDraft} disabled={isFooterDisabled}><img src={DELETE_ICON_SRC} alt="delete draft"/>Discard Draft</button>
                            {solutionStatus === "draft" && <button className="action-button action-button--submit-draft" onClick={onSubmitDraft} disabled={isFooterDisabled}><img src={SUBMIT_ICON_SRC} alt="submit draft"/>Submit for Review</button>}
                            {solutionStatus === "under_review" && <button className="action-button action-button--submit-draft" onClick={onPublishSolution} disabled={isFooterDisabled}><img src={SUBMIT_ICON_SRC} alt="submit draft"/>Publish Solution</button>}
                            <button className="info-button info-button--footer" onClick={handleInfoButtonClick} disabled={isFooterDisabled} aria-expanded={isShowingInfo} aria-controls="footer-info">i</button>
                        </div>
                    </div>

                    <div className="footer-info">
                        <p><strong>Discard Draft:</strong> This is a description</p>
                        {solutionStatus === "draft"
                            ? <p><strong>Submit for Review:</strong> Description</p>
                            : <p><strong>Publish Solution:</strong> Description</p>}
                    </div>

                </div>
            </div>
            <div className={`footer-overlay ${isShowingInfo ? "footer-overlay-active" : ""}`}></div>
        </>
    );
};

export default SolutionDraftFooter;