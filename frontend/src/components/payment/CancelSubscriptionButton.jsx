import { useState } from 'react';
import { Button } from '../ui/button';
import { useAuth } from '@/lib/hooks/AuthContext';
import { toast } from 'sonner';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '../ui/dialog';
import { cancelSubscription } from '@/lib/hooks/api/stripeApi';

const CancelSubscriptionButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user, refreshUserData } = useAuth();
  
  // Don't render if no subscription exists OR subscription is already canceled
  if (!user || 
      user.is_subscribed !== 1 || 
      user.stripe_plan_status === 'canceled') {
    return null;
  }
  
  const handleCancelSubscription = async () => {
    try {
      setIsLoading(true);
      const result = await cancelSubscription(user.id);
      
      // Close dialog and show success message
      setIsOpen(false);
      
      toast.success("Subscription canceled successfully");
      
      // Refresh user data to update UI
      if (refreshUserData) {
        await refreshUserData();
      }
    } catch (error) {
        console.error("Error canceling subscription:", error);
        toast.error("Failed to cancel subscription. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Button label based on subscription state
  const buttonLabel = user.stripe_plan_status === 'canceled'
    ? "Subscription Ending" 
    : "Cancel Subscription";
  
  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="text-destructive border-destructive hover:bg-destructive/10"
        disabled={user.stripe_plan_status === 'canceled' || isLoading}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : buttonLabel}
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription? You'll still have access until {formatDate(user.subscription_ends_at)}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-3">
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-sm text-amber-800">
              <div className="flex">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p>Canceling your subscription means you'll lose access to premium features after the current billing period.</p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="mr-2">Keep Subscription</Button>
            </DialogClose>
            <Button 
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={isLoading}
            >
              {isLoading ? "Canceling..." : "Yes, Cancel Subscription"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CancelSubscriptionButton;