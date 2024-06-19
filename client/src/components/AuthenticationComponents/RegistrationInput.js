import React, {useEffect} from 'react';
import {formConfigurations} from "../Forms/formConfigurations";
import GenericForm from "../Forms/GenericForm";
import {useFormData} from "../../context/FormDataContext";
import {useToasts} from "../../context/ToastContext";

const RegistrationInput = ({onSuccessfulSubmit}) => {
    const registrationFormConfig = formConfigurations.registrationForm;
    const {registrationFormData, setRegistrationFormData, wipeFormData} = useFormData();
    const {addToast} = useToasts();

    useEffect(()=> {
        return () => {
            wipeFormData({wipeRegistrationFormData: true});
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleRegister = async (data) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (response.ok) {
                addToast("Registration successful! Please log in to continue.", 6000);
                onSuccessfulSubmit();
            } else {
                throw new Error(result.message || "An error occurred during registration. Please try again.");
            }
        } catch (error) {
            if (error.message === 'NetworkError when attempting to fetch resource.') {
                throw new Error("Network error: Unable to reach the server. Please check your connection and try again.");
            } else {
                throw new Error(error.message);
            }
        }
    };

    return (
        <div className="login-container" style={{padding: "20px 50px 40px"}}>
            <h1 className="login-heading">Register</h1>
            <GenericForm
                onSubmit={handleRegister}
                config={registrationFormConfig}
                formData={registrationFormData}
                setFormData={setRegistrationFormData}
                authorizationCheck={false}
            />
        </div>
    );
};

export default RegistrationInput;
