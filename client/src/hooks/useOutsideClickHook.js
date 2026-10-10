import {useCallback, useEffect, useRef} from "react";
import {useConfirmationModal} from "../context/ConfirmationModalContext";
import {useLoading} from "../context/LoadingContext";


function useOutsideClick (callback) {
    const ref = useRef();
    const {isModalOpenRef} = useConfirmationModal();
    const {isLoadingRef} = useLoading();

    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    const handleClickOutside = useCallback((event) => {
        if (isModalOpenRef.current || isLoadingRef.current) return;
        if (ref.current && !ref.current.contains(event.target)) {
            callbackRef.current();
        }
    }, [isModalOpenRef, isLoadingRef]);

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside, {passive: true});
        document.addEventListener("touchstart", handleClickOutside, {passive: true});

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [handleClickOutside]);

    return ref;
}

export default useOutsideClick;