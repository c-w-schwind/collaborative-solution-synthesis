import React, {createContext, useContext, useState, useCallback} from "react";
import LoadingOverlay from "../components/LoadingOverlay";

const LoadingContext = createContext();

export const LoadingProvider = ({children}) => {
    const [isLoading, setIsLoading] = useState(false);

    const showLoading = useCallback(() => {
        setIsLoading(true);
    }, []);

    const hideLoading = useCallback(() => {
        setIsLoading(false);
    }, []);

    return (
        <LoadingContext.Provider value={{isLoading, showLoading, hideLoading}}>
            {children}
            <LoadingOverlay isVisible={isLoading}/>
        </LoadingContext.Provider>
    );
};

export const useLoading = () => useContext(LoadingContext);
