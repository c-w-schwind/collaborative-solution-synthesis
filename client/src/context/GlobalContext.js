import React, {createContext, useContext, useState} from 'react';

const GlobalContext = createContext();

export const GlobalProvider = ({children}) => {
    const [isSolutionDraft, setIsSolutionDraft] = useState("");

    return (
        <GlobalContext.Provider value={{isSolutionDraft, setIsSolutionDraft}}>
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobal = () => {
    const context = useContext(GlobalContext);
    if (context === undefined) {
        throw new Error('useGlobal must be used within a GlobalProvider');
    }
    return context;
}