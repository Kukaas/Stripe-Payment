import api from "../api";

export const createCheckoutSession = async (priceId, userId) => {
    try {
        const response = await api.post("/stripe/create-checkout-session", {
            priceId,
            userId
        }, {
            withCredentials: true
        });
        
        return response.data.url;
    } catch (error) {
        console.error("Error creating checkout session:", error);
        throw error;
    }
};

export const getSubscriptionDetails = async () => {
    try {
        const response = await api.get("/stripe/subscription", {
            withCredentials: true
        });
        
        return response.data;
    } catch (error) {
        console.error("Error getting subscription details:", error);
        throw error;
    }
};