import React, {createContext, useContext, useState, useCallback, useMemo} from "react";
import LoadingOverlay from "../components/CommonComponents/LoadingOverlay";

const LoadingContext = createContext();

export const LoadingProvider = ({children}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");

    const showLoading = useCallback((message) => {
        setIsLoading(true);
        setMessage(message);
    }, []);

    const hideLoading = useCallback(() => {
        setIsLoading(false);
        setTimeout(() => setMessage(""), 100); // Matches the overlay's hide transition.
    }, []);

    const value = useMemo(() => ({
        isLoading,
        showLoading,
        hideLoading
    }), [isLoading, showLoading, hideLoading]);


    return (
        <LoadingContext.Provider value={value}>
            {children}
            <LoadingOverlay isVisible={isLoading} message={message}/>
        </LoadingContext.Provider>
    );
};

export const useLoading = () => useContext(LoadingContext);
