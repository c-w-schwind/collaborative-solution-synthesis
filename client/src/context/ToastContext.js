import {createContext, useContext, useState} from "react";
import ToastManager from "../components/ToastComponents/ToastManager";

const ToastContext = createContext();

export const ToastProvider = ({children}) => {
    const [toasts, setToasts] = useState([]);

    function addToast(message, timeout = 4000) {
        const id = Date.now();
        setToasts(currentToasts => [...currentToasts, { message, id, timeout }]);

        setTimeout(() => removeToast(id), timeout);
    }

    function removeToast (id) {
        setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
    }

    return (
        <ToastContext.Provider value={{addToast, removeToast}}>
            {children}
            <ToastManager toasts={toasts} removeToast={removeToast}/>
        </ToastContext.Provider>
    );
};

export function useToasts () {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToasts must be used within a ToastProvider');
    }
    return context;
}