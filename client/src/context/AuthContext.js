import {createContext, useState, useEffect, useContext, useCallback, useMemo} from 'react';
import {jwtDecode} from "jwt-decode";
import {useToasts} from "./ToastContext";
import {useNavigate} from "react-router-dom";

export const AuthContext = createContext();

const isTokenExpired = (decodedToken) => {
    try {
        const currentTime = Date.now() / 1000;
        return decodedToken.exp < currentTime;
    } catch (error) {
        console.error('Error decoding token:', error);
        return true;
    }
};

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isFirstTime, setIsFirstTime] = useState(false);
    const navigate = useNavigate();
    const {addToast} = useToasts();

    const login = useCallback((userData, token) => {
        localStorage.setItem('token', token);
        setIsLoggedIn(true);
        setUser(userData);
        if (!isFirstTime) {
            addToast(`Welcome back, ${userData.username}!`, 5000);
        } else {
            addToast(`Welcome on board, ${userData.username}. Happy to have you!`, 5000);
            setIsFirstTime(false);
        }
    }, [addToast, isFirstTime]);

    const logout = useCallback(({redirect = true, message = "You have successfully been logged out.", timeout = 5000} = {}) => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setUser(null);
        if (redirect) {
            navigate('/login');
        }
        addToast(message, timeout);
    }, [addToast, navigate]);

    const handleFirstTime = useCallback(() => setIsFirstTime(true), []);


    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        async function validateTokenAndFetchUser(retryCount = 0) {
            try {
                const decodedToken = jwtDecode(token);
                if (isTokenExpired(decodedToken)) {
                    throw new Error('Token expired');
                }

                const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${decodedToken._id}`, {
                    headers: {'Authorization': `Bearer ${token}`}
                });

                if (!response.ok) {
                    throw new Error(`HTTP status ${response.status}`);
                }

                const userData = await response.json();
                setUser(userData);
                setIsLoggedIn(true);
                if (!sessionStorage.getItem('welcomeBackShown')) {
                    addToast(`Welcome back, ${userData.username}!`, 5000);
                    sessionStorage.setItem('welcomeBackShown', 'true');
                }
            } catch (error) {
                console.error('Authentication error:', error.message);
                if (error.name === 'FetchError' || error.name === 'TypeError' || error.code === 'ECONNREFUSED') {
                    if (retryCount < 3) {
                        addToast(`Server connection failed. Attempting to reconnect... (${retryCount + 1}/3)`, 3000);
                        setTimeout(() => validateTokenAndFetchUser(retryCount + 1), 3000);
                    } else {
                        addToast('Unable to connect to the server. Please check your internet connection, then try again later.', 10000);
                    }
                } else {
                    logout({redirect: true, message: 'Session expired. Please log in again.', timeout: 10000});
                }
            }
        }

        validateTokenAndFetchUser();
    }, [logout, addToast]);


    const value = useMemo(() => ({
        isLoggedIn,
        user,
        login,
        logout,
        handleFirstTime
    }), [isLoggedIn, user, login, logout, handleFirstTime]);

    return (
        <AuthContext.Provider value={value}>
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