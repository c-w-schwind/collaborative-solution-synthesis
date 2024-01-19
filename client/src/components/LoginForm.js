import React, { useState } from 'react';
import './LoginForm.css';

function LoginForm({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    function handleUsername (event){
        setUsername(event.target.value);
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
            await onLogin(username, password);
        } catch (error) {
            setError(error.message);
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
                        value={username}
                        onChange={handleUsername}
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
                <div className="error">{"Test" + error}</div>
                <button type="submit" disabled={!username || !password || loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
}

export default LoginForm;