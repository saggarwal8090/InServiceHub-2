import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Determine API base URL — in production, use relative URLs (same origin)
const API_URL = import.meta.env.VITE_API_URL || '/api';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            } catch {
                // Corrupted localStorage data — clear it
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const res = await axios.post(`${API_URL}/login`, { email, password });
            const { token, user } = res.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);
            return { success: true, role: user.role };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed. Please check your credentials and try again.'
            };
        }
    };

    const register = async (userData) => {
        try {
            const res = await axios.post(`${API_URL}/register`, userData);
            const { token, user } = res.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed. Please try again.'
            };
        }
    };

    const loginWithGoogle = async (googleToken) => {
        try {
            const res = await axios.post(`${API_URL}/auth/google`, { token: googleToken });
            
            if (res.data.isNewUser) {
                return { isNewUser: true, googleData: res.data.googleData };
            }

            const { token, user } = res.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);
            return { success: true, role: user.role };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Google Login failed.'
            };
        }
    };

    const completeGoogleLogin = async (googleToken, role) => {
        try {
            const res = await axios.post(`${API_URL}/auth/google-complete`, { token: googleToken, role });
            const { token, user } = res.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);
            return { success: true, role: user.role };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error completing registration.'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, loginWithGoogle, completeGoogleLogin, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
