import { createContext, useContext, useEffect, useState } from "react";
import apiClient from "../services/api.js";

const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchCurrentUser = async () => {
        try {
            const response = await apiClient.get("/users/current-user");
            if (response.data && response.data.success === true && response.data.data.user) {
                setUser(response.data.data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    const login = (userData, token) => {
        if (token) {
            localStorage.setItem("accessToken", token);
        }
        setUser(userData);
        setLoading(false);
    };

    const logout = async () => {
        try {
            await apiClient.post("/users/logout");
        } catch (error) {
            console.error("Logout request failed:", error);
        } finally {
            localStorage.removeItem("accessToken");
            setUser(null);
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refreshAuth: fetchCurrentUser }}>
            {children}
        </AuthContext.Provider>
    );
};
export const useAuth=()=>{
    const context=useContext(AuthContext)
    if(!context) throw new Error("useAuth must be inside an AuthProvider")
    return context;
}