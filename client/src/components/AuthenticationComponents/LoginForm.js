import React, { useState } from 'react';
import './LoginForm.css';
import {useAuth} from "../../context/AuthContext";
import {useLocation, useNavigate} from 'react-router-dom'


function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const {login} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    function handleEmail (event){
        setEmail(event.target.value);
        setError('');
    }

    function handlePassword (event){
        setPassword(event.target.value);
        setError('');
    }

    async function handleSubmit (event) {
        event.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();

            if (response.ok) {
                login(data.user, data.token);
                const {from} = location.state || {from: {pathname: "/"}};
                navigate(from.pathname);
            } else {
                setError(data.message || 'An error occurred during login.');
                console.info('Login attempt failed:', data.message);
            }
        } catch (error) {
            setError('An unexpected error occurred. Please try again later.');
            console.error('Unexpected login error:', error);
        }

        setLoading(false);
    }

    return (
        <div className="login-container">
            <h1 className="login-heading">Login</h1>
            <form className="login-form" onSubmit={handleSubmit}>
                <div>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={handleEmail}
                        placeholder="Email"
                    />
                </div>
                <div>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={handlePassword}
                        placeholder="Password"
                    />
                </div>
                <div className={`error ${error ? 'show' : ''}`}>{error}</div>
                <button type="submit" disabled={!email || !password || loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
}

export default LoginForm;