import {createContext, useState, useEffect, useContext, useMemo} from "react";
import {getScrollbarWidth} from "../utils/utils";

export const LayoutContext = createContext();

export const LayoutProvider = ({children}) => {
    const [isOverlayActive, setIsOverlayActive] = useState(false);
    const [elementOverlayColor, setElementOverlayColor] = useState("rgba(0, 0, 0, 0.5)");

    useEffect(() => {
        if (isOverlayActive) {
            document.body.style.overflow = "hidden";
            document.body.style.paddingRight = `${getScrollbarWidth()}px`;
        } else {
            document.body.style.overflow = "";
            document.body.style.paddingRight = "";
        }
    }, [isOverlayActive]);

    const value = useMemo(() => ({
        isOverlayActive, setIsOverlayActive, elementOverlayColor, setElementOverlayColor
    }),[isOverlayActive, elementOverlayColor]);

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