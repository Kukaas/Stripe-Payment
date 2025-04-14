import api from "@/lib/hooks/api";
import { Loader2 } from "lucide-react";
import { createContext, useContext, useEffect, useState, useRef } from "react";

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
    const [subscription, setSubscription] = useState(null);
    const isRefreshing = useRef(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get("/auth/me", { withCredentials: true });
                setUser(response.data.user);
                
                // Extract subscription data from user
                if (response.data.user && response.data.user.is_subscribed) {
                    setSubscription({
                        isActive: response.data.user.is_subscribed,
                        planStatus: response.data.user.stripe_plan_status,
                        subscriptionEndsAt: response.data.user.subscription_ends_at,
                        priceId: response.data.user.stripe_price_id
                    });
                }
            } catch (error) {
                console.error("Error fetching user:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);    const refreshUserData = async () => {
        // Use a state flag to prevent multiple simultaneous refreshes
        if (isRefreshing.current) return;
        
        isRefreshing.current = true;
        
        try {
            // Don't set loading to true here, as it causes full re-renders
            // and may contribute to the infinite loop
            const response = await api.get("/auth/me", { withCredentials: true });
            
            // Update user data
            setUser(response.data.user);
            
            // Update subscription data only if it's different from current
            const userData = response.data.user;
            
            if (userData && userData.is_subscribed) {
                const newSubscriptionData = {
                    id: userData.stripe_subscription_id, // Make sure ID is included
                    isActive: userData.is_subscribed,
                    planStatus: userData.stripe_plan_status,
                    subscriptionEndsAt: userData.subscription_ends_at,
                    priceId: userData.stripe_price_id,
                    has_used_trial: userData.has_used_trial
                };
                
                setSubscription(newSubscriptionData);
            } else {
                setSubscription(null);
            }
        } catch (error) {
            console.error("Error refreshing user data:", error);
        } finally {
            // Only update the refreshing flag, not the loading state
            isRefreshing.current = false;
        }
    };

    return (
        <AuthContext.Provider value={{
            user, 
            setUser, 
            loading,
            subscription,
            refreshUserData
        }}>
            {loading ? <Loading /> : children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    return useContext(AuthContext);
};