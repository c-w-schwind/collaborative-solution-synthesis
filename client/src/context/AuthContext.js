import {createContext, useState, useEffect, useContext} from 'react';
import {jwtDecode} from "jwt-decode";
import {useToasts} from "./ToastContext";
import {useNavigate} from "react-router-dom";

export const AuthContext = createContext();

const isTokenExpired = (decodedTokenData) => {
    try {
        const currentTime = Date.now() / 1000;
        return decodedTokenData.exp < currentTime;
    } catch (error) {
        console.error('Error decoding token:', error);
        return true;
    }
};

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const {addToast} = useToasts();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        async function validateAndFetchUserData(retryCount = 0) {
            try {
                const decodedData = jwtDecode(token);
                if (isTokenExpired(decodedData)) {
                    throw new Error('Token expired');
                }

                const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${decodedData._id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) {
                    throw new Error(`HTTP status ${response.status}`);
                }

                const userData = await response.json();
                setUser(userData);
                setIsLoggedIn(true);
                addToast(`Welcome back, ${userData.username}!`, 5000);
            } catch (error) {
                console.error('Authentication error:', error.message);
                if (error.name === 'FetchError' || error.name === 'TypeError' || error.code === 'ECONNREFUSED') {
                    if (retryCount < 3) {
                        addToast(`Server connection failed. Attempting to reconnect... (${retryCount + 1}/3)`, 3000);
                        setTimeout(() => validateAndFetchUserData(retryCount + 1), 3000);
                    } else {
                        addToast('Unable to connect to the server. Please check your internet connection, then try again later.', 10000);
                    }
                } else {
                    logout({ redirect: true, message: 'Session expired. Please log in again.', timeout: 10000 });
                }
            }
        }

        validateAndFetchUserData();
    }, []);

    const login = (userData, token) => {
        localStorage.setItem('token', token);
        setIsLoggedIn(true);
        setUser(userData);
        addToast(`Welcome back, ${userData.username}!`, 5000);
    };

    const logout = ({ redirect = true, message = "You have successfully been logged out.", timeout = 5000  } = {}) => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setUser(null);
        if (redirect) {
            navigate('/login');
        }
        addToast(message, timeout);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}