import LoginForm from '../components/LoginForm';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

function LoginPage() {
    const { login } = useAuth();

    async function handleLogin(email, password) {
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
                login(data.user, data.token); // Save the token and user data
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            // Handle error (e.g., show an error message)
        }
    }

    return (
        <div>
            <LoginForm onLogin={handleLogin} />
        </div>
    );
}

export default LoginPage;