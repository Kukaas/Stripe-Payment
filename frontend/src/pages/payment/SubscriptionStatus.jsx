import { useAuth } from "@/lib/hooks/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Link } from "react-router-dom";
import CancelSubscriptionButton from "@/components/payment/CancelSubscriptionButton";

const SubscriptionStatus = () => {
    const { user } = useAuth();
    
    // If no subscription data is available
    if (!user || user.is_subscribed !== 1) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Subscription Status</CardTitle>
                    <CardDescription>You don't have an active subscription</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-4">
                        Subscribe to one of our plans to get access to all premium features.
                    </p>
                </CardContent>
                <CardFooter>
                    <Button asChild className="w-full">
                        <Link to="/payment">View Plans</Link>
                    </Button>
                </CardFooter>
            </Card>
        );
    }
    
    // Get status badge based on subscription status
    const getStatusBadge = () => {
        if (user.stripe_plan_status === 'canceled') {
            return <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">Canceling</Badge>;
        }
        
        if (user.is_in_trial === 1) {
            return <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">Trial</Badge>;
        }
        
        if (user.stripe_plan_status === 'active') {
            return <Badge variant="default">Active</Badge>;
        }
        
        return <Badge variant="outline">Inactive</Badge>;
    };
    
    // If subscription is active
    const isCanceled = user.stripe_plan_status === 'canceled';
    
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Subscription Status</CardTitle>
                    <CardDescription>Manage your current subscription</CardDescription>
                </div>
                {getStatusBadge()}
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Plan Type</span>
                    <span className="font-medium">{getPlanName(user.stripe_price_id)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                        {isCanceled ? "Access Until" : "Renewal Date"}
                    </span>
                    <span className="font-medium">
                        {user.subscription_ends_at ? formatDate(user.subscription_ends_at) : 'N/A'}
                    </span>
                </div>
                
                {user.is_in_trial === 1 && (
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Trial Ends</span>
                        <span className="font-medium">
                            {user.trial_ends_at ? formatDate(user.trial_ends_at) : 'N/A'}
                        </span>
                    </div>
                )}
                
                {isCanceled && (
                    <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
                        <p className="text-orange-800 text-sm">
                            Your subscription has been canceled. You'll have access to premium features until {formatDate(user.subscription_ends_at)}.
                        </p>
                    </div>
                )}
            </CardContent>         
            <CardFooter className="flex flex-col sm:flex-row gap-2">
                {!isCanceled && (
                    <>
                        <Button asChild variant="outline" className="w-full sm:w-auto">
                            <Link to="/payment">Change Plan</Link>
                        </Button>
                        <CancelSubscriptionButton />
                    </>
                )}
                
                {isCanceled && (
                    <Button asChild className="w-full">
                        <Link to="/payment">Resubscribe</Link>
                    </Button>
                )}
                
                <Button variant="outline" className="w-full sm:w-auto" asChild>
                    <a href="https://billing.stripe.com/p/login/test_yourportallink" target="_blank" rel="noopener noreferrer">
                        Manage Billing
                    </a>
                </Button>
            </CardFooter>
        </Card>
    );
};

// Helper function to convert price ID to plan name
function getPlanName(priceId) {
    const priceIdToName = {
        [import.meta.env.VITE_STRIPE_PRICE_ID_BASIC]: 'Basic Plan',
        [import.meta.env.VITE_STRIPE_PRICE_ID_PREMIUM]: 'Premium Plan',
        [import.meta.env.VITE_STRIPE_PRICE_ID_ADVANCED]: 'Advanced Plan'
    };
    
    return priceIdToName[priceId] || 'Custom Plan';
}

export default SubscriptionStatus;