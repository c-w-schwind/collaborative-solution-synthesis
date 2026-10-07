import {createContext, useCallback, useContext, useState} from "react";
import Toast from "../components/ToastComponents/Toast";

const ToastContext = createContext();

export const ToastProvider = ({children}) => {
    const [toasts, setToasts] = useState([]);

    const removeToast = (id) => {
        setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
    };

    const addToast = useCallback((message, timeout = 3500) => {
        const id = Date.now() + Math.random();
        setToasts(currentToasts => [...currentToasts, {message, id, timeout}]);
    }, []);


    return (
        <ToastContext.Provider value={addToast}>
            {children}
            <div className="toast-container">
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        onClose={() => removeToast(toast.id)}
                        timeout={toast.timeout}
                    />
                ))}
            </div>
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