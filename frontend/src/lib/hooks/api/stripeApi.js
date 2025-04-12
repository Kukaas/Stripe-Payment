import axios from "axios";

const baseUrl = import.meta.env.VITE_API_URL;

export const createCheckoutSession = async (priceId) => {
    try {
        const response = await axios.post(`${baseUrl}/stripe/create-checkout-session`, {
            priceId,
        });
        return response.data.url;
    }
    catch (error) {
        console.error("Error creating checkout session:", error);
        throw new Error("Failed to create checkout session");
    }
}