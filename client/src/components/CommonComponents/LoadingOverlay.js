import './LoadingOverlay.css';
import {createPortal} from "react-dom";
import {useEffect, useRef, useState} from "react";

const LoadingOverlay = ({isVisible, message, isFullScreen = true, isSidePanel = false}) => {
    const [overlayVisible, setOverlayVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const overlayRef = useRef(null);


    useEffect(() => {
        let timeoutId;
        if (isVisible) {
            setShouldRender(true);
            // Use setTimeout to activate overlay smoothly after UI updates, preventing rendering glitches
            setTimeout(() => {
                setOverlayVisible(true)

                if (overlayRef.current) {
                    overlayRef.current.focus(); // Trap focus on overlay
                }
            }, 100);
        } else {
            setOverlayVisible(false);
            if (isSidePanel) {
                setShouldRender(false); // Preventing glitching behavior of modal during discussion space opening
            } else {
                timeoutId = setTimeout(() => setShouldRender(false), 100); // Matching .loading-overlay CSS fade-out transition time
            }
            return () => clearTimeout(timeoutId);
        }
        return () => {
            clearTimeout(timeoutId);
        };
    }, [isVisible, isSidePanel]);


    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isVisible) {
                e.stopPropagation();
            }
        };

        if (isVisible) {
            document.addEventListener('keydown', handleKeyDown, true);
        }

        return () => document.removeEventListener('keydown', handleKeyDown, true);
    }, [isVisible]);


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