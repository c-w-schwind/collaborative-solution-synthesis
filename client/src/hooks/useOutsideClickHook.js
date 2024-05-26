import {useCallback, useEffect, useRef} from "react";

// useEffect omits 'handleClickOutside' from dependencies to avoid frequent re-triggering.
// Ensure the 'callback' provided to useOutsideClick does not change over the component's lifecycle.
// Changing 'callback' requires a different handling strategy.
function useOutsideClick (callback) {
    const ref = useRef();

    const handleClickOutside = useCallback((event) => {
        if (ref.current && !ref.current.contains(event.target)) {
            callback();
        }
    }, [callback]);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, []);

    return ref;
}

export default useOutsideClick;