import React, {createContext, useContext, useState} from 'react';

const GlobalContext = createContext();

/**
 * - elementListChange: Object to handle optimistic solution element list updates
 *    - changeType ('delete' or 'update')
 *    - elementNumber
 *    - changeType 'update': add additional field that is relevant to element card display (title, overview, change_summary)
 */
export const GlobalProvider = ({children}) => {
    const [isSolutionDraft, setIsSolutionDraft] = useState(false);
    const [elementListChange, setElementListChange] = useState(null);

    return (
        <GlobalContext.Provider value={{isSolutionDraft, setIsSolutionDraft, elementListChange, setElementListChange}}>
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