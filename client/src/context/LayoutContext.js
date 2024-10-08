import {createContext, useState, useEffect, useContext} from "react";

export const LayoutContext = createContext();

export const LayoutProvider = ({children}) => {
    const [isElementModalOpen, setIsElementModalOpen] = useState(false);
    const [scrollbarWidth, setScrollbarWidth] = useState(0);
    const [overlayColor, setOverlayColor] = useState("rgba(0, 0, 0, 0.5)");

    useEffect(() => {
        if (isElementModalOpen) {
            const scrollbarWidthCalculated = window.innerWidth - document.documentElement.clientWidth;
            setScrollbarWidth(scrollbarWidthCalculated);
            document.body.style.overflow = "hidden";
            document.body.style.paddingRight = `${scrollbarWidthCalculated}px`;
        } else {
            document.body.style.overflow = "";
            document.body.style.paddingRight = "";
            setScrollbarWidth(0);
        }
    }, [isElementModalOpen]);

    return (
        <LayoutContext.Provider value={{setIsElementModalOpen, scrollbarWidth, overlayColor, setOverlayColor}}>
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
