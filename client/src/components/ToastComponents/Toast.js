import "./Toast.css";
import React, {useCallback, useEffect, useRef, useState} from "react";

function Toast({message, onClose, timeout}) {
    const [isFadingOut, setIsFadingOut] = useState(false);

    const timeoutRef = useRef(null);
    const timerStartRef = useRef(null);
    const remainingTimeRef = useRef(timeout);


    const startTimer = useCallback(() => {
        timerStartRef.current = Date.now();
        timeoutRef.current = setTimeout(() => setIsFadingOut(true), remainingTimeRef.current);
    }, []);

    const pauseTimer = () => {
        clearTimeout(timeoutRef.current);

        if (isFadingOut) {
            setIsFadingOut(false);
        }

        const elapsed = Date.now() - timerStartRef.current;
        remainingTimeRef.current = Math.max(remainingTimeRef.current - elapsed, 0);

        remainingTimeRef.current = Math.max(
            remainingTimeRef.current,
            2000
        );
    };

    const handleTransitionEnd = (event) => {
        if (event.propertyName === "opacity" && isFadingOut) {
            onClose();
        }
    };


    useEffect(() => {
        startTimer();
        return () => clearTimeout(timeoutRef.current);
    }, [startTimer]);


    return (
        <div className={`toast ${isFadingOut ? "fade-out" : ""}`} onMouseEnter={pauseTimer} onMouseLeave={startTimer} onTransitionEnd={handleTransitionEnd} role="alert" aria-live="assertive">
            <div className="toast-content">
                <span className="toast-message">{message}</span>
                <button onClick={onClose} className="toast-close-button" aria-label="Close toast">X</button>
            </div>
        </div>
    );
}

export default Toast;