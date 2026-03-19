import React, { createContext, useState, useEffect } from "react";
import api from "../api/apiClient";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    async function fetchMe() {
        try {
            // Verifies token with the backend
            const res = await api.get("/auth/me");
            setUser(res.data.user);
        } catch {
            setUser(null);
            localStorage.removeItem("token");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            fetchMe();
        } else {
            setLoading(false);
        }
    }, []);

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
}