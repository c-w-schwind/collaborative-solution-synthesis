import React, {useEffect, useState} from 'react';
import LoginForm from '../components/AuthenticationComponents/LoginForm';
import './LoginPage.css';
import RegistrationInput from "../components/AuthenticationComponents/RegistrationInput";
import {useAuth} from "../context/AuthContext";

function LoginPage() {
    const [isRegistering, setIsRegistering] = useState(false);
    const {handleFirstTime} = useAuth();

    useEffect(() => {
        const formActionArea = document.querySelector('.generic-form-action-area');
        if (formActionArea) {
            if (isRegistering) {
                formActionArea.classList.add('register');
            } else {
                formActionArea.classList.remove('register');
            }
            return () => {
                formActionArea.classList.remove('register');
            };
        }
    }, [isRegistering]);

    const handleRegisterClick = () => {
        setIsRegistering(prevState => !prevState);
    };

    const handleSuccessfulRegister = () => {
        setIsRegistering(false);
        handleFirstTime(true);
    }

    return (
        <div className="login-page">
            {isRegistering ? (
                <>
                    <RegistrationInput onSuccessfulSubmit={handleSuccessfulRegister}/>
                    <div className="register-link">
                        <button onClick={handleRegisterClick}>Back to Login</button>
                    </div>
                </>
            ) : (
                <>
                    <LoginForm/>
                    <div className="register-link">
                        Don't have an account yet? <button onClick={handleRegisterClick}>Register here</button>
                    </div>
                </>
            )}
        </div>
    );
}

export default LoginPage;
