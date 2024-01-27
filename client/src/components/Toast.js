import "./Toast.css";

function Toast({ message, onClose, timeout }) {
    const fadeOutStart = timeout - 800;

    return (
        <div className="toast" style={{
            animation: `slideIn 0.5s, fadeOut 0.8s ${fadeOutStart}ms forwards`
        }}>
            {message}
            <button onClick={onClose} className="toast-close-button">X</button>
        </div>
    );
}

export default Toast;