import React, {createContext, useContext, useState} from 'react';

const GlobalContext = createContext();

export const GlobalProvider = ({children}) => {
    const [isSolutionDraft, setIsSolutionDraft] = useState(false);
    const [wasElementDraftEdited, setWasElementDraftEdited] = useState(false);

    return (
        <GlobalContext.Provider value={{isSolutionDraft, setIsSolutionDraft, wasElementDraftEdited, setWasElementDraftEdited}}>
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