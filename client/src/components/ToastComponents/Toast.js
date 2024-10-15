import "./Toast.css";
import React, {useCallback, useEffect, useRef, useState} from "react";

function Toast({message, onClose, timeout}) {
    const [isFadingOut, setIsFadingOut] = useState(false);

    const toastRef = useRef(null);
    const timeoutRef = useRef(null);
    const timerStartRef = useRef(null);
    const timeLeftRef = useRef(timeout - 800);


    const startTimer = useCallback(() => {
        timerStartRef.current = Date.now();
        timeoutRef.current = setTimeout(() => setIsFadingOut(true), timeLeftRef.current);
    }, []);

    const stopTimer = useCallback(() => {
        clearTimeout(timeoutRef.current);

        if (isFadingOut) {
            setIsFadingOut(false);
        }

        const elapsed = Date.now() - timerStartRef.current;
        timeLeftRef.current = Math.max(timeLeftRef.current - elapsed, 0);

        if (timeLeftRef.current < 2000) {
            timeLeftRef.current += 2000;
        }
    }, [isFadingOut]);


    useEffect(() => {
        startTimer();
        return () => clearTimeout(timeoutRef.current);
    }, [startTimer]);

    useEffect(() => {
        const handleTransitionEnd = (event) => {
            if (event.propertyName === "opacity" && isFadingOut) {
                onClose();
            }
        };
        const currentToast = toastRef.current;
        if (currentToast) currentToast.addEventListener("transitionend", handleTransitionEnd);

        return () => currentToast && currentToast.removeEventListener("transitionend", handleTransitionEnd);
    }, [isFadingOut, onClose]);


    return (
        <div ref={toastRef} className={`toast ${isFadingOut ? "fade-out" : ""}`} onMouseEnter={stopTimer} onMouseLeave={startTimer} role="alert" aria-live="assertive" style={{animation: "slideIn 0.5s"}}>
            <div className="toast-content">
                <span className="toast-message">{message}</span>
                <button onClick={onClose} className="toast-close-button" aria-label="Close toast">X</button>
            </div>
        </div>
    );
}

export default React.memo(Toast);