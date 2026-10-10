import './LoadingOverlay.css';
import {createPortal} from "react-dom";
import {useEffect, useRef, useState} from "react";

const LoadingOverlay = ({isVisible, message, isFullScreen = true, isSidePanel = false}) => {
    const [overlayVisible, setOverlayVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    const overlayRef = useRef(null);
    const previouslyFocusedElementRef = useRef(null);


    useEffect(() => {
        let timeoutId;
        if (isVisible) {
            setShouldRender(true);
            // Delay visibility until after the overlay has mounted, allowing the fade-in transition to run
            timeoutId = setTimeout(() => {
                setOverlayVisible(true);

                if (isFullScreen && overlayRef.current) {
                    overlayRef.current.focus();
                }
            }, 100);
        } else {
            setOverlayVisible(false);
            if (isSidePanel) {
                setShouldRender(false); // Prevent glitching behavior of modal during discussion space opening
            } else {
                timeoutId = setTimeout(() => setShouldRender(false), 100); // Matches .loading-overlay fade-out transition
            }
        }
        return () => clearTimeout(timeoutId);
    }, [isVisible, isFullScreen, isSidePanel]);


    useEffect(() => {
        if (!isVisible || !isFullScreen) return;

        previouslyFocusedElementRef.current = document.activeElement;

        const handleKeyDown = (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
            }
            e.stopPropagation();
        };

        document.addEventListener('keydown', handleKeyDown, true);

        return () => {
            document.removeEventListener('keydown', handleKeyDown, true);

            if (
                previouslyFocusedElementRef.current &&
                document.contains(previouslyFocusedElementRef.current)
            ) {
                previouslyFocusedElementRef.current.focus();
            }
        };
    }, [isVisible, isFullScreen]);


    if (!shouldRender) return null;

    const overlayContent = (
        <div ref={overlayRef} tabIndex="-1" className={`loading-overlay ${isFullScreen ? 'full-screen' : 'component-level'} ${isSidePanel ? "side-panel" : ""} ${overlayVisible ? 'visible' : ''}`}>
            <div className="loading-content">
                <div className="spinner"></div>
                {message && <div className="loading-message">{message}</div>}
            </div>
        </div>
    );

    if (isFullScreen) {
        return createPortal(overlayContent, document.body);
    }

    return overlayContent;
};

export default LoadingOverlay;