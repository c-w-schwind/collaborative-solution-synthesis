import './ConfirmationModal.css';
import {useEffect, useRef} from "react";
import {createPortal} from "react-dom";
import {lockBodyScroll, unlockBodyScroll} from "../../utils/utils";

const ConfirmationModal = ({isVisible, title, message, onConfirm, onCancel, entityType, buttonMode = "standard", size = 400}) => {
    const previouslyFocusedElement = useRef(null);
    const cancelButtonRef = useRef(null);
    const confirmButtonRef = useRef(null);

    // Handle focus trapping within modal, keydown events (Tab for navigation & Escape to cancel), restore focus after modal close
    useEffect(() => {
        if (isVisible) {
            previouslyFocusedElement.current = document.activeElement;
            confirmButtonRef.current.focus();

            lockBodyScroll();

            const handleKeyDown = (e) => {
                if (e.key === 'Tab') {
                    const focusableElements = [cancelButtonRef.current, confirmButtonRef.current];
                    const focusedIndex = focusableElements.indexOf(document.activeElement);

                    if (e.shiftKey) { // Shift + Tab
                        if (focusedIndex === 0) {
                            e.preventDefault();
                            focusableElements[1].focus();
                        }
                    } else { // Tab
                        if (focusedIndex === 1) {
                            e.preventDefault();
                            focusableElements[0].focus();
                        }
                    }
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    onCancel();
                }
            };

            document.addEventListener('keydown', handleKeyDown);

            return () => {
                document.removeEventListener('keydown', handleKeyDown);
                unlockBodyScroll();
                if (previouslyFocusedElement.current) {
                    previouslyFocusedElement.current.focus();
                }
            };
        }
    }, [isVisible, onCancel]);


    const buttonLabels = {
        standard: "Confirm",
        delete: "Delete",
        submit_for_review: "Submit for Review",
        initiate_review: "Initiate Review Phase",
        publish: `Publish ${entityType}`
    };


    if (!isVisible) return null;

    // Sentinel elements wrapping modal-content necessary for focus trapping in Safari
    return createPortal(
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="modal-content" style={{ maxWidth: `${size}px` }}>

                <div tabIndex="0" aria-hidden="true" onFocus={() => cancelButtonRef.current.focus()}></div>

                <h2 id="modal-title">{title}</h2>
                <p>{message}</p>
                <div className="modal-actions">
                    <button ref={cancelButtonRef} onClick={onCancel} className="modal-button cancel-button">Cancel</button>
                    <button
                        ref={confirmButtonRef}
                        onClick={onConfirm}
                        className={`modal-button ${buttonMode === "standard" ? "action-button--propose-changes" : "action-button--discard-draft"}`}
                    >{buttonLabels[buttonMode] || "Confirm"}</button>
                </div>

                <div tabIndex="0" aria-hidden="true" onFocus={() => confirmButtonRef.current.focus()}></div>

            </div>
        </div>,
        document.body
    );
};

export default ConfirmationModal;