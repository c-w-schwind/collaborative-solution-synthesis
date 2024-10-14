import './ConfirmationModal.css';
import {useLayout} from "../context/LayoutContext";
import {useEffect, useRef} from "react";
import {createPortal} from "react-dom";

const ConfirmationModal = ({isVisible, title, message, onConfirm, onCancel, mode = "standard", size}) => {
    const {setIsOverlayActive} = useLayout();
    const cancelButtonRef = useRef(null);
    const confirmButtonRef = useRef(null);


    useEffect(() => {
        setIsOverlayActive(isVisible);
    }, [isVisible, setIsOverlayActive]);

    // Handle focus trapping within modal, keydown events (Tab f. navigation & Escape to cancel), restore focus after modal close
    useEffect(() => {
        if (isVisible) {
            const previouslyFocusedElement = document.activeElement;
            confirmButtonRef.current.focus();

            const handleKeyDown = (e) => {
                if (e.key === 'Tab') {
                    if (e.shiftKey) { // Shift + Tab
                        if (document.activeElement === cancelButtonRef.current) {
                            e.preventDefault();
                            confirmButtonRef.current.focus();
                        }
                    } else { // Tab
                        if (document.activeElement === confirmButtonRef.current) {
                            e.preventDefault();
                            cancelButtonRef.current.focus();
                        }
                    }
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    onCancel();
                }
            };

            document.addEventListener('keydown', handleKeyDown);
            document.body.setAttribute('aria-hidden', 'true');

            return () => {
                document.removeEventListener('keydown', handleKeyDown);
                document.body.removeAttribute('aria-hidden');
                if (previouslyFocusedElement) {
                    previouslyFocusedElement.focus();
                }
            };
        }
    }, [isVisible, onCancel]);


    const buttonLabels = {
        standard: "Confirm",
        delete: "Delete",
        "submit for review": "Submit for Review",
        "initiate review": "Initiate Reviewing",
        publish: "Publish Solution",
    };


    if (!isVisible) return null;

    return createPortal(
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="modal-content" style={{maxWidth: `${size}px`}}>
                <h2 id="modal-title">{title}</h2>
                <p>{message}</p>
                <div className="modal-actions">
                    <button ref={cancelButtonRef} onClick={onCancel} className="modal-button cancel-button">Cancel</button>
                    <button
                        ref={confirmButtonRef}
                        onClick={onConfirm}
                        className={`modal-button ${mode === "standard" ? "action-button--propose-changes" : "action-button--discard-draft"}`}
                    >{buttonLabels[mode] || "Confirm"}</button>
                </div>
            </div>
        </div>,
        document.body
    );

};

export default ConfirmationModal;