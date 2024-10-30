import "./SolutionDraftFooter.css";
import {useCallback, useState} from "react";
import {useLocation} from "react-router-dom";
import {getScrollbarWidth} from "../../utils/utils";
import useOutsideClick from "../../hooks/useOutsideClickHook";
import {DELETE_ICON_SRC, SUBMIT_ICON_SRC} from "../../constants";


const SolutionDraftFooter = ({onDiscardDraft, onSubmitDraft, onPublishSolution, solutionStatus, isFooterDisabled, isUserAuthor, isChangeProposal}) => {
    const [isShowingInfo, setIsShowingInfo] = useState(false);
    const [scrollbarWidth] = useState(getScrollbarWidth() || 16); // Initialize in state to prevent transition on mount

    const location = useLocation();
    const isHidden = location.pathname.split("/").includes("element");

    const infoRef = useOutsideClick(() => setIsShowingInfo(false));


    const handleInfoButtonClick = useCallback(() => {
        setIsShowingInfo(prev => !prev)
    }, []);

    const getFooterTitle = useCallback(() => {
        let title = solutionStatus === "draft" ? "Draft - " : "Review Phase - ";
        title += isChangeProposal ? "Change Proposal" : "New Solution";

        return <h2 className="footer-heading">{title}</h2>;
    }, [isChangeProposal, solutionStatus]);


    return (
        <>
            <div className={`page-footer ${isHidden ? "hidden" : isShowingInfo ? "expanded" : ""}`}  style={{width: `calc(100vw - ${scrollbarWidth}px)`}}>
                <div ref={infoRef} className="page-footer-content">

                    <div className="footer-top">
                        {getFooterTitle()}

                        <div className="footer-button-section">
                            {isUserAuthor && <button className="action-button action-button--discard-draft" onClick={onDiscardDraft} disabled={isFooterDisabled}><img src={DELETE_ICON_SRC} alt="delete draft"/>Discard Solution</button>}
                            {solutionStatus === "draft" && (<button className="action-button action-button--submit-draft" onClick={onSubmitDraft} disabled={isFooterDisabled}><img src={SUBMIT_ICON_SRC} alt="submit draft"/>Submit for Review</button>)}
                            {solutionStatus === "under_review" && isUserAuthor && <button className="action-button action-button--submit-draft" onClick={onPublishSolution} disabled={isFooterDisabled}><img src={SUBMIT_ICON_SRC} alt="submit draft"/>Publish Solution</button>}
                            <button className="info-button info-button--footer" onClick={handleInfoButtonClick} disabled={isFooterDisabled} aria-expanded={isShowingInfo} aria-controls="footer-info">i</button>
                        </div>
                    </div>

                    <div className="footer-info">
                        {isUserAuthor ? (
                            <>
                                <p><strong>Discard Draft:</strong> This is a description</p>
                                solutionStatus === "draft" ? (
                                    <p><strong>Submit for Review:</strong> Description</p>
                                ) : (
                                    <p><strong>Publish Solution:</strong> Description</p>
                                )
                            </>
                        ) : (
                            <>
                                <p><strong>Review Phase:</strong> This is a description for how the review phase works. You are one of the three assigned reviewers to look over the solution and do some shit. Make sure to check out the elements in detail as well, consider their interplay and review everything. Be critical but also constructive. Everything you find to improve upon will benefit the whole community. Make sure you are aware of your responsibility.<br/>Text could be a bit bigger, though.</p>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <div className={`footer-overlay ${isShowingInfo ? "footer-overlay-active" : ""}`}></div>
        </>
    );
};

export default SolutionDraftFooter;