import {useCallback, useEffect, useRef} from "react";

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
    }, [handleClickOutside]);

    return ref;
}

export default useOutsideClick;