import Toast from "./Toast";

function ToastManager({toasts, removeToast}) {
    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <Toast key={toast.id} message={toast.message} onClose={() => removeToast(toast.id)} timeout={toast.timeout}/>
            ))}
        </div>
    );
}

export default ToastManager;