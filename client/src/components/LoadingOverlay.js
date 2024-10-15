import './LoadingOverlay.css';
import {createPortal} from "react-dom";

const LoadingOverlay = ({isVisible}) => {
    if (!isVisible) return null;

    return createPortal(
        <div className="loading-overlay">
            <div className="spinner"></div>
        </div>,
        document.body
    );
};

export default LoadingOverlay;