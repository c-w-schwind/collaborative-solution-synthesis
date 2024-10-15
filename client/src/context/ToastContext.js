import {createContext, useCallback, useContext, useMemo, useState} from "react";
import ToastManager from "../components/ToastComponents/ToastManager";

const ToastContext = createContext();

export const ToastProvider = ({children}) => {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
    }, []);

    const addToast = useCallback((message, timeout = 4000) => {
        const id = Date.now() + Math.random();
        setToasts(currentToasts => [...currentToasts, {message, id, timeout}]);
    }, []);

    const value = useMemo(() => ({
        addToast, removeToast
    }), [addToast, removeToast]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <ToastManager toasts={toasts} removeToast={removeToast}/>
        </ToastContext.Provider>
    );
};

export function useToasts() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToasts must be used within a ToastProvider');
    }
    return context;
}