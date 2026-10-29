import {createContext, useContext, useEffect, useState} from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);

    async function refreshUser() {
        try {
            setLoading(true);
            const res = await fetch(
                "http://localhost:3000/api/users/me",
                { credentials: "include" }
            );

            if (res.status === 401) {
                setUser(null);
                setAuthError(null);
                return false;
            }

            if (!res.ok) {
                throw new Error(`Failed to retrieve user: ${res.status}`);
            }

             const userData = await res.json();

            setUser(userData);
            setAuthError(null);

            return true;

        } catch (error) {
            console.error("Failed to refresh user:", error);
            setAuthError("Unable to verify authentication");
            return false;
        } finally {
            setLoading(false);
        }
    }
    function clearUser() {
        setUser(null);
        setAuthError(null);
    }


    useEffect(() => {
        refreshUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, authError,refreshUser, clearUser}}>
            {children}
        </AuthContext.Provider>
    );

}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside an AuthProvider");
    }

    return context;
}
