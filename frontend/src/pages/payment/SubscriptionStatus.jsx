import { useAuth } from "@/lib/hooks/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Link } from "react-router-dom";

const SubscriptionStatus = () => {
    const { subscription } = useAuth();
    
    // If no subscription data is available
    if (!subscription) {
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
                        <Link to="/payments">View Plans</Link>
                    </Button>
                </CardFooter>
            </Card>
        );
    }
    
    // If subscription is active
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Subscription Status</CardTitle>
                    <CardDescription>Manage your current subscription</CardDescription>
                </div>
                <Badge variant={subscription.planStatus === 'active' ? 'default' : 'outline'}>
                    {subscription.planStatus === 'active' ? 'Active' : 'Inactive'}
                </Badge>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Plan Type</span>
                    <span className="font-medium">{getPlanName(subscription.priceId)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Renewal Date</span>
                    <span className="font-medium">
                        {subscription.subscriptionEndsAt ? formatDate(subscription.subscriptionEndsAt) : 'N/A'}
                    </span>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2">
                <Button asChild variant="outline" className="w-full sm:w-auto">
                    <Link to="/payment">Change Plan</Link>
                </Button>
                <Button className="w-full sm:w-auto" asChild>
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