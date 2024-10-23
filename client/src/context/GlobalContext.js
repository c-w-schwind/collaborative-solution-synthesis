import React, {createContext, useCallback, useContext, useMemo, useRef, useState} from 'react';

const GlobalContext = createContext();

/**
 * - elementListChange: Object to handle optimistic solution element list updates
 *    - changeType ('delete' or 'update')
 *    - elementNumber
 *    - changeType 'update': add additional field that is relevant to element card display (title, overview, changeSummary)
 */
export const GlobalProvider = ({children}) => {
    const [isSolutionDraft, setIsSolutionDraft] = useState(false);
    const [elementListChange, setElementListChange] = useState(null);
    const [shouldRefetchSolution, setShouldRefetchSolution] = useState(false);
    const lastRefetchTimeRef = useRef(0);
    const REFETCH_DELAY = 120000; // 2 minutes

    const requestSolutionRefetch = useCallback(() => {
        const currentTime = Date.now();
        if (currentTime - lastRefetchTimeRef.current > REFETCH_DELAY) {
            setShouldRefetchSolution(true);
            lastRefetchTimeRef.current = currentTime;
        }
    }, []);

    const clearSolutionRefetchFlag = useCallback(() => {
        setShouldRefetchSolution(false);
    }, []);

    const value = useMemo(() => ({
        isSolutionDraft,
        setIsSolutionDraft,
        elementListChange,
        setElementListChange,
        shouldRefetchSolution,
        requestSolutionRefetch,
        clearSolutionRefetchFlag
    }), [
        isSolutionDraft,
        setIsSolutionDraft,
        elementListChange,
        setElementListChange,
        shouldRefetchSolution,
        requestSolutionRefetch,
        clearSolutionRefetchFlag
    ]);

    return (
        <GlobalContext.Provider value={value}>
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
};