import {useCallback, useEffect, useState} from "react";
import {useToasts} from "../../context/ToastContext";
import './GenericForm.css';

const GenericForm = ({config, onSubmit}) => {
    const [formData, setFormData] = useState(() => config.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {}));
    const [isFormFilled, setIsFormFilled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const {addToast} = useToasts();

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isFormFilled) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes! Are you sure you want to leave?';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isFormFilled]);

    const displayToastWarning = useCallback(() => {
        if (isFormFilled) addToast("Warning: To prevent losing your message, please copy and save it before refreshing the page.", 10000);
    }, [isFormFilled, addToast]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => {
            const updatedFormData = { ...prevState, [name]: value };
            setIsFormFilled(Object.values(updatedFormData).some(val => val.trim() !== ''));
            return updatedFormData;
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        for (const {name} of config) {
            if (!formData[name].trim()) {
                setError(`Field "${name[0].toUpperCase() + name.slice(1)}" cannot be empty.`);
                return;
            }
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setError('Unauthorized: Please log in to submit your post.');
            return;
        }

        setLoading(true);

        try {
            await onSubmit(formData);
            setFormData(config.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {})); // Resets formData with all fields set to empty strings
        } catch (err) {
            displayToastWarning();
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            {config.map(field => (
                <div key={field.name} className="form-group">
                    {field.type === 'textarea' ? (
                        <>
                            <textarea
                                name={field.name}
                                value={formData[field.name] || ""}
                                onChange={handleChange}
                                placeholder=" "
                                style={{ height: field.height || 'auto' }}
                                className="text-area"
                            />
                            <label className="label">{field.label}</label>
                        </>
                    ) : (
                        <>
                            <input
                                type={field.type}
                                name={field.name}
                                value={formData[field.name] || ""}
                                onChange={handleChange}
                                placeholder=" "
                                style={{ height: field.height || 'auto' }}
                                className="input-field"
                            />
                            <label className="label">{field.label}</label>
                        </>
                    )}
                </div>
            ))}
            <div className="action-area">
                {error && <div className="form-error">{error}</div>}
                <button type="submit" disabled={!isFormFilled || loading}>Submit</button>
            </div>
        </form>
    );
}

export default GenericForm;