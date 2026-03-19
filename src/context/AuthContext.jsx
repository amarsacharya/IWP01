import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Try real endpoint
                    const userData = await authService.getCurrentUser();
                    setUser(userData);
                } catch (error) {
                    console.error('Failed to authenticate token with backend. Logging out.');
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };

        // Add a small delay to prevent flicker during fast local reloads
        setTimeout(initAuth, 100);
    }, []);

    const login = async (credentials) => {
        const data = await authService.login(credentials);
        localStorage.setItem('token', data.token);
        // Exclude token from the user object state
        const { token, ...userData } = data;
        setUser(userData);
        return userData;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
