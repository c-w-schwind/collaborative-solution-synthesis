import {createContext, useState, useEffect, useContext} from 'react';
import {jwtDecode} from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        async function fetchUserData (userId) {
            try {
                const response = await fetch(`http://localhost:5555/users/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }
                const userData = await response.json();
                setUser(userData);
            } catch (err) {
                console.error('Error fetching user data:', err);
                // TODO: Handle errors (e.g., logging out the user, showing an error message, redirecting to login page)
            }
        }

        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);

            try {
                const decodedData = jwtDecode(token);
                fetchUserData(decodedData._id);
            } catch (error) {
                console.error('Invalid token:', error);
                // TODO: Handle invalid token, e.g., clear it from localStorage
            }
        }
    }, []);

    const login = (userData, token) => {
        localStorage.setItem('token', token);
        setIsLoggedIn(true);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setUser(null);
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
