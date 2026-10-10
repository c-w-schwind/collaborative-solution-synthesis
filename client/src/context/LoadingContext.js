import React, {createContext, useContext, useState, useCallback, useMemo, useRef} from "react";
import LoadingOverlay from "../components/CommonComponents/LoadingOverlay";

const LoadingContext = createContext();

export const LoadingProvider = ({children}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const isLoadingRef = useRef(false);

    const showLoading = useCallback((message) => {
        isLoadingRef.current = true;
        setMessage(message);
        setIsLoading(true);
    }, []);

    const hideLoading = useCallback(() => {
        isLoadingRef.current = false;
        setIsLoading(false);
    }, []);

    const value = useMemo(() => ({
        isLoadingRef,
        showLoading,
        hideLoading
    }), [showLoading, hideLoading]);


    return (
        <LoadingContext.Provider value={value}>
            {children}
            <LoadingOverlay isVisible={isLoading} message={message}/>
        </LoadingContext.Provider>
    );
};

export const useLoading = () => useContext(LoadingContext);
