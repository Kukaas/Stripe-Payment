import { createCheckoutSession } from "@/lib/hooks/api/stripeApi";
import { Button } from "../ui/button";
import { useState } from "react";
import { useAuth } from "@/lib/hooks/AuthContext";
import { toast } from "sonner";

const SubscribeButton = ({priceId}) => {
    const [isLoading, setIsLoading] = useState(false);
    const { user, subscription } = useAuth()
    
    // Check if user is already subscribed to this plan
    const isCurrentPlan = subscription && subscription.priceId === priceId;

    const handleCheckout = async () => {
        if (!user) {
            toast.error({
                title: "Authentication required",
                description: "Please sign in to subscribe to this plan.",
                variant: "destructive",
            });
            return;
        }
        
        if (isCurrentPlan) {
            toast.warn({
                title: "Already subscribed",
                description: "You're already subscribed to this plan.",
                variant: "default",
            });
            return;
        }
        
        try {
            setIsLoading(true);
            const sessionUrl = await createCheckoutSession(priceId, user.id);

            if (sessionUrl) {
                window.location.href = sessionUrl;
            } else {
                console.error("Failed to create checkout session");
                toast.error({
                    title: "Checkout failed",
                    description: "Failed to create checkout session. Please try again.",
                    variant: "destructive",
                });
                setIsLoading(false);
            }
        } catch (error) {
            console.error("Checkout error:", error);
            toast.error({
                title: "Checkout error",
                description: error.message || "An error occurred during checkout",
                variant: "destructive",
            });
            setIsLoading(false);
        }
    }

    // Determine button text based on subscription status
    const getButtonText = () => {
        if (isCurrentPlan) {
            return "Current Plan";
        }
        if (subscription) {
            return "Change Plan";
        } if (priceId === "price_1RDOtA06eeOxQrFFHWKZNhxj") {
            return "Start Free Trial";
        }
        return "Subscribe Now";
    };

    return (
        <Button
            onClick={handleCheckout}
            disabled={isLoading || isCurrentPlan}
            className={`w-full py-6 text-base font-medium ${
                isCurrentPlan 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            } transition-all duration-300 rounded-xl shadow-lg hover:shadow-blue-300/30 text-white`}
        >
            {isLoading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                </>
            ) : (
                <>
                    {getButtonText()}
                    {!isCurrentPlan && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    )}
                </>
            )}
        </Button>
    )
}

export default SubscribeButton;