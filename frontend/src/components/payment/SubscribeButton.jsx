import { createCheckoutSession, changePlan } from "@/lib/hooks/api/stripeApi";
import { Button } from "../ui/button";
import { useState } from "react";
import { useAuth } from "@/lib/hooks/AuthContext";
import { toast } from "sonner";

const SubscribeButton = ({priceId}) => {    const [isLoading, setIsLoading] = useState(false);
    const { user, subscription, refreshUserData } = useAuth()
    
    // Check if user is already subscribed to this plan
    const isCurrentPlan = subscription && subscription.priceId === priceId;    const handleCheckout = async () => {
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
            
            // Check if user already has any subscription (we need to use the change plan flow)
            if (subscription && subscription.id) {
                // Use plan change flow with automatic refund
                const result = await changePlan(user.id, priceId);
                
                toast.success({
                    title: "Plan Changed Successfully",
                    description: result.message,
                });                // If there was a refund, show that info
                if (result.refund && result.refund.amount > 0) {
                    toast.info({
                        title: "Refund Processed",
                        description: `A refund of $${result.refund.amount.toFixed(2)} has been processed for your previous plan.`,
                    });
                }
                
                // Refresh user data using the AuthContext function instead of page reload
                await refreshUserData();
                setIsLoading(false);           } else {
                // Standard checkout flow for new subscriptions
                // We need to bypass the free trial if:
                // 1. User has used a trial before OR
                // 2. User has an active subscription OR
                // 3. User is currently in a trial
                const isChangingPlan = 
                    (user?.has_used_trial === 1 || user?.has_used_trial === true) || // Has used trial before
                    (user?.is_subscribed === 1 || user?.is_subscribed === true) ||   // Has active subscription
                    (user?.is_in_trial === 1 || user?.is_in_trial === true);         // Is in trial period
                
                const sessionUrl = await createCheckoutSession(priceId, user.id, isChangingPlan);
    
                if (sessionUrl) {
                    window.location.href = sessionUrl;
                } else {
                    console.error("Failed to create checkout session");
                    toast.error({
                        title: "Checkout failed",
                        description: "Failed to create checkout session. Please try again.",
                        variant: "destructive",
                    });
                }
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
    }    // Determine button text based on subscription status
    const getButtonText = () => {
        if (isCurrentPlan) {
            return "Current Plan";
        }
        
        // If user has any active subscription, always show "Change Plan"
        if (subscription) {
            return "Change Plan";
        }
        
        // Only show "Start Free Trial" if it's the basic plan, user has no subscription,
        // and they haven't used their trial before
        const isBasicPlan = priceId === "price_1RDOtA06eeOxQrFFHWKZNhxj";
        const hasUsedTrial = user?.has_used_trial === 1 || user?.has_used_trial === true;
        
        if (isBasicPlan && !hasUsedTrial) {
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