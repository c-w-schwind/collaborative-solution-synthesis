import {useCallback, useEffect, useRef} from "react";
import {useConfirmationModal} from "../context/ConfirmationModalContext";
import {useLoading} from "../context/LoadingContext";


function useOutsideClick (callback) {
    const ref = useRef();
    const {confirmationModalContent} = useConfirmationModal();
    const {isLoading} = useLoading();

    const isModalVisibleRef = useRef(confirmationModalContent.isVisible);
    const isLoadingRef = useRef(isLoading);
    const callbackRef = useRef(callback);

    useEffect(() => {
        isModalVisibleRef.current = confirmationModalContent.isVisible;
    }, [confirmationModalContent.isVisible]);

    useEffect(() => {
        isLoadingRef.current = isLoading;
    }, [isLoading]);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    const handleClickOutside = useCallback((event) => {
        if (isModalVisibleRef.current || isLoadingRef.current) return;
        if (ref.current && !ref.current.contains(event.target)) {
            callbackRef.current();
        }
    }, []);

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