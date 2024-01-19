import React, { useState } from 'react';
import './LoginForm.css';
import {useAuth} from "../context/AuthContext";
import { useNavigate } from 'react-router-dom'


function LoginForm () {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const {login} = useAuth();
    const navigate = useNavigate();

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
            const response = await fetch('http://localhost:5555/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();

            if (response.ok) {
                login(data.user, data.token);
                navigate('/');
            } else {
                setError('Login failed: ' + data.message);
                throw new Error(data.message || 'Login failed');
            }
        } catch (error) {
            setError(error.message);
            console.error('Login error:', error);
        }

        setLoading(false);
    }

    return (
        <div className="login-container">
            <h1 className="login-heading">Login</h1>
            <form className="login-form" onSubmit={handleSubmit}>
                <div>
                    <input
                        type="text"
                        id="username"
                        value={email}
                        onChange={handleEmail}
                        placeholder="Username"
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
                <div className="error">{error}</div>
                <button type="submit" disabled={!email || !password || loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
}

export default LoginForm;