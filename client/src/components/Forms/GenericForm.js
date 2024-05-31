import {useCallback, useEffect, useState} from "react";
import {useToasts} from "../../context/ToastContext";
import './GenericForm.css';

const GenericForm = ({onSubmit, config, formData, setFormData}) => {
    const [isFormFilled, setIsFormFilled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const {addToast} = useToasts();

    useEffect(() => {
        setIsFormFilled(Object.values(formData).some(val => val.trim() !== ''));
    }, [formData]);

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
        const {name, value} = e.target;
        setFormData(prevState => ({...prevState, [name]: value}));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        for (const {name, label} of config) {
            if (!formData[name].trim()) {
                setError(`Field "${label}" cannot be empty.`);
                return;
            }
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setError('Unauthorized: Please log in to submit your contribution.');
            return;
        }

        setLoading(true);

        try {
            await onSubmit(formData);
            setFormData(config.reduce((acc, field) => ({...acc, [field.name]: ''}), {}));
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
                                style={{height: field.height || 'auto'}}
                                className="form-text-area"
                            />
                            <label className="form-label">{field.label}</label>
                        </>
                    ) : field.type === 'select' ? (
                        <>
                            <select
                                name={field.name}
                                value={formData[field.name] || ""}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="" disabled hidden>Select the stance of your consideration</option>
                                {field.options.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                            <label className="form-label">{field.label}</label>
                        </>
                    ) : (
                        <>
                            <input
                                type={field.type}
                                name={field.name}
                                value={formData[field.name] || ""}
                                onChange={handleChange}
                                placeholder=" "
                                style={{height: field.height || 'auto'}}
                                className="form-input-field"
                            />
                            <label className="form-label">{field.label}</label>
                        </>
                    )}
                </div>
            ))}
            <div className="form-action-area">
                {error && <div className="form-error">{error}</div>}
                <button type="submit" disabled={!isFormFilled || loading}>Submit</button>
            </div>
        </form>
    );
}

export default GenericForm;