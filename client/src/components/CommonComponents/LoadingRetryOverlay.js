import { useState, useEffect } from 'react';
import './LoadingRetryOverlay.css';


const LoadingRetryOverlay = ({componentName, retryCount, onHandleRetry}) => {
    const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);
    const [fetchAnimationDots, setFetchAnimationDots] = useState("");

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setShowLoadingIndicator(true);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setFetchAnimationDots(prevDots => prevDots.length < 3 ? prevDots + "." : ".");
        }, 700);

        return () => clearInterval(intervalId);
    }, []);

    const handleClick = (event) => {
        event.stopPropagation();
    };

    return (
        <div className="loading-retry-area" style={{ visibility: showLoadingIndicator ? "visible" : "hidden" }}>
            <div className="loading-retry-container" onClick={handleClick}>
                {retryCount === 0 ? (
                    <p className="loading-retry-message">Loading {componentName} details... Please wait.<br/><br/><br/>{fetchAnimationDots}</p>
                ) : retryCount < 4 ? (
                    <p className="loading-retry-message">Attempting to load {componentName} details again.
                        <br/>(Attempt {retryCount} / 3)
                        <br/><br/>{fetchAnimationDots}</p>
                ) : (
                    <p className="loading-retry-message">
                        Couldn't load {componentName} details.<br/>Please check your network connection or try again later.<br/>
                    </p>
                )}
                {retryCount >= 4 ? (
                    <button className="retry-button" onClick={() => {onHandleRetry(); setFetchAnimationDots(".")}}>Retry</button>
                ) : (
                    <span className="retry-placeholder"></span>
                )}
            </div>
        </div>
    );
};

export default LoadingRetryOverlay;