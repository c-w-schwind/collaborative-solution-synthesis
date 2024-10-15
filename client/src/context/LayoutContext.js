import {createContext, useState, useContext, useMemo} from "react";

export const LayoutContext = createContext();

export const LayoutProvider = ({children}) => {
    const [elementOverlayColor, setElementOverlayColor] = useState("rgba(0, 0, 0, 0.5)");

    const value = useMemo(() => ({
        elementOverlayColor, setElementOverlayColor
    }),[elementOverlayColor]);

    return (
        <LayoutContext.Provider value={value}>
            {children}
        </LayoutContext.Provider>
    );
};

export const useLayout = () => {
    const context = useContext(LayoutContext);
    if (context === undefined) {
        throw new Error('useLayout must be used within a LayoutProvider');
    }
    return context;
};