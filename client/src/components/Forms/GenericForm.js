import {useCallback, useEffect, useState} from "react";
import {useToasts} from "../../context/ToastContext";
import './GenericForm.css';


// previousData & onCancel are optional and only needed for solution draft mode
const GenericForm = ({onSubmit, config, formData, setFormData, authorizationCheck = true, previousData = null, onCancel}) => {
    const [isFormFilled, setIsFormFilled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const isDraftMode = previousData !== null;

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

    const hasFormDataChanged = useCallback(() => {
        return Object.keys(formData).some(key => formData[key] !== previousData[key]);
    }, [formData, previousData, isDraftMode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isDraftMode && !hasFormDataChanged()) {
            addToast("No changes detected. Please modify the form to submit.");
            return;
        }
        setError('');

        for (const {name, label} of config.fields) {
            if (!formData[name].trim()) {
                setError(`Field "${label}" cannot be empty.`);
                return;
            }
        }

        if (authorizationCheck) {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Unauthorized: Please log in to submit your contribution.');
                return;
            }
        }

        setLoading(true);

        try {
            await onSubmit(formData);
            setFormData(config.fields.reduce((acc, field) => ({...acc, [field.name]: ''}), {}));
        } catch (err) {
            displayToastWarning();
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <form onSubmit={handleSubmit} className="generic-form-area">
            {config.description &&
                <>
                    <p className="generic-form-description">{config.description}</p>
                    <hr style={{backgroundColor: "gray", border: "none", height: "0.7px", width: "80%", margin: "25px"}}/>
                </>}
            {config.fields.map(field => (
                <div key={field.name} className="generic-form-group">
                    {field.type === 'textarea' ? (
                        <>
                            <textarea
                                name={field.name}
                                value={formData[field.name] || ""}
                                onChange={handleChange}
                                placeholder=" "
                                style={{minHeight: field.height || 'auto'}}
                                className="generic-form-text-area"
                            />
                            <label className="generic-form-label">{field.label}</label>
                        </>
                    ) : field.type === 'select' ? (
                        <>
                            <select
                                name={field.name}
                                value={formData[field.name] || ""}
                                onChange={handleChange}
                                className="generic-form-select"
                            >
                                <option value="" disabled hidden>{field.placeholder || 'Select an option'}</option>
                                {field.options.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                            <label className="generic-form-label">{field.label}</label>
                        </>
                    ) : (
                        <>
                            <input
                                type={field.type}
                                name={field.name}
                                value={formData[field.name] || ""}
                                onChange={handleChange}
                                placeholder=" "
                                autoComplete="off"
                                style={{height: field.height || 'auto'}}
                                className="generic-form-input-field"
                            />
                            <label className="generic-form-label">{field.label}</label>
                        </>
                    )}
                </div>
            ))}
            <div className="generic-form-action-area">
                <div className="generic-form-error">{error}</div>
                {isDraftMode && <button type="button" className="solution-element-action-button--close" onClick={() => onCancel(hasFormDataChanged())} style={{marginRight: "8px"}}>Cancel</button>}
                <button type="submit" disabled={!isFormFilled || loading}>Submit</button>
            </div>
        </form>
    );
}

export default GenericForm;