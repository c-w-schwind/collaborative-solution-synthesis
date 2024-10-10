import {createContext, useState, useEffect, useContext} from "react";
import {getScrollbarWidth} from "../utils/utils";

export const LayoutContext = createContext();

export const LayoutProvider = ({children}) => {
    const [isOverlayActive, setIsOverlayActive] = useState(false);
    const [scrollbarWidth, setScrollbarWidth] = useState(0);
    const [elementOverlayColor, setElementOverlayColor] = useState("rgba(0, 0, 0, 0.5)");

    useEffect(() => {
        if (isOverlayActive) {
            setScrollbarWidth(getScrollbarWidth());
            document.body.style.overflow = "hidden";
            document.body.style.paddingRight = `${getScrollbarWidth()}px`;
        } else {
            document.body.style.overflow = "";
            document.body.style.paddingRight = "";
            setScrollbarWidth(0);
        }
    }, [isOverlayActive]);

    return (
        <LayoutContext.Provider value={{setIsOverlayActive, scrollbarWidth, elementOverlayColor, setElementOverlayColor}}>
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
