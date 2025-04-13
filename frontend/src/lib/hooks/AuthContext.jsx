import api from "@/lib/hooks/api";
import { Loader2 } from "lucide-react";
import { createContext, useContext, useEffect, useState } from "react";

export const AuthContext = createContext();

const Loading = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-background">
            <Loader2 className="animate-spin h-15 w-15 text-primary dark:text-primary" viewBox="0 0 24 24" />
            <p className="text-muted-foreground dark:text-muted-foreground text-lg mt-4">
                Please wait while we load your data...
            </p>
        </div>
    );
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get("/auth/me", { withCredentials: true });
                setUser(response.data.user);
            } catch (error) {
                console.error("Error fetching user:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    return (
        <AuthContext.Provider value={{user, setUser, loading}}>
            {loading ? <Loading /> : children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    return useContext(AuthContext);
};