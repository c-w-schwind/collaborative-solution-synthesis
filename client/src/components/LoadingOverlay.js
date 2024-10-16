import './LoadingOverlay.css';
import {createPortal} from "react-dom";

const LoadingOverlay = ({isVisible, message}) => {
    if (!isVisible) return null;

    return createPortal(
        <div className="loading-overlay" role="alert" aria-busy="true" aria-live="assertive">
            <div className="loading-content">
                <div className="spinner"></div>
                {message && <div className="loading-message">{message}</div>}
            </div>
        </div>,
        document.body
    );
};

export default LoadingOverlay;
