import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

interface AuthContextType {
    isLoggedIn: boolean;
    token: string | null;
    user: any;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    fetchUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
    const [user, setUser] = useState<any>(null);

    // Get API URL from environment variable - falls back to localhost for development
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    const login = async (email: string, password: string) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
                email,
                password,
            });

            const { token: newToken } = response.data;
            localStorage.setItem('authToken', newToken);
            setToken(newToken);
            setIsLoggedIn(true);
            await fetchUserProfile();
        } catch (error) {
            throw new Error('Login failed');
        }
    };

    const fetchUserProfile = async () => {
        if (!token) return;

        try {
            const response = await axios.get(`${API_BASE_URL}/api/user/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log('User profile response:', response.data);
            setUser(response.data.user);
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
        }
    };

    const logout = () => {
        setIsLoggedIn(false);
        setToken(null);
        setUser(null);
        localStorage.removeItem('authToken');
    };

    React.useEffect(() => {
        if (token) {
            setIsLoggedIn(true);
            fetchUserProfile();
        }
    }, [token]);

    return (
        <AuthContext.Provider value={{ isLoggedIn, token, user, login, logout, fetchUserProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};