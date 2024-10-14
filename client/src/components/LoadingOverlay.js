import './LoadingOverlay.css';
import {useLayout} from "../context/LayoutContext";
import {useEffect} from "react";
import {createPortal} from "react-dom";

const LoadingOverlay = ({isVisible}) => {
    const {setIsOverlayActive} = useLayout();

    useEffect(() => {
        setIsOverlayActive(isVisible);
    }, [isVisible, setIsOverlayActive]);

    if (!isVisible) return null;

    return createPortal(
        <div className="loading-overlay">
            <div className="spinner"></div>
        </div>,
        document.body
    );
};

export default LoadingOverlay;