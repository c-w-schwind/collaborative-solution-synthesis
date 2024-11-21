import './LoadingOverlay.css';
import { createPortal } from "react-dom";

const LoadingOverlay = ({ isVisible, message, isFullScreen = true }) => {
    if (!isVisible) return null;

    const overlayContent = (
        <div className={`loading-overlay ${isFullScreen ? 'full-screen' : 'component-level'}`}>
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
