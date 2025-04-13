import { useState } from "react";
import SubscribeButton from "@/components/payment/SubscribeButton";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "../Layout";

// Store multiple price IDs for different subscription tiers
const priceIds = {
    basic: import.meta.env.VITE_STRIPE_PRICE_ID_BASIC,
    premium: import.meta.env.VITE_STRIPE_PRICE_ID_PREMIUM,
    advanced: import.meta.env.VITE_STRIPE_PRICE_ID_ADVANCED,
};

const Subscription = () => {
    const [selectedPlan, setSelectedPlan] = useState('premium');

    // Subscription plan data
    const plans = [
        {
            id: 'basic',
            name: 'Basic Plan',
            price: '$3.99/month',
            priceId: priceIds.basic,
            features: [
                'Essential features',
                'Email support',
                'Single device'
            ],
            color: 'from-blue-50 to-blue-100',
            accent: 'blue'
        },
        {
            id: 'premium',
            name: 'Premium Plan',
            price: '$5.99/month',
            priceId: priceIds.premium,
            features: [
                'All Basic features',
                'Priority support',
                'Up to 3 devices',
                'Advanced analytics'
            ],
            color: 'from-purple-50 to-purple-100',
            accent: 'purple',
            recommended: true
        },
        {
            id: 'advanced',
            name: 'Advanced Plan',
            price: '$8.99/month',
            priceId: priceIds.advanced,
            features: [
                'All Premium features',
                '24/7 phone support',
                'Unlimited devices',
                'Custom integrations',
                'Dedicated account manager'
            ],
            color: 'from-teal-50 to-teal-100',
            accent: 'teal'
        }
    ];

    return (
        <Layout>
            <div className="flex justify-center items-center h-full w-full px-4">
                <div className="w-full max-w-6xl">                    
                    <div className="text-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Choose Your Plan</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">Select a subscription plan that fits your needs and unlock features that help you achieve your goals.</p>
                    </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">                        {plans.map((plan) => (                            <Card 
                                key={plan.id}
                                className={`border border-border overflow-hidden transition-all duration-300 ${
                                    selectedPlan === plan.id 
                                        ? 'ring-1 ring-primary' 
                                        : 'hover:border-border/80'
                                } ${plan.recommended ? 'md:z-20' : 'md:z-10'}`}
                                onClick={() => setSelectedPlan(plan.id)}
                            >
                                {plan.recommended && (
                                    <div className="bg-primary text-primary-foreground text-center py-1.5 text-xs font-normal tracking-wider uppercase relative">
                                        Recommended
                                    </div>
                                )}
                                  <CardContent className="flex flex-col h-full p-6">
                                    <div className="mb-8">
                                        <h3 className="text-base font-medium mb-2 text-foreground">{plan.name}</h3>
                                        <div className="flex items-baseline">
                                            <span className="text-3xl font-normal text-foreground">{plan.price}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-8 flex-grow">
                                        <ul className="space-y-3">
                                            {plan.features.map((feature, index) => (
                                                <li key={index} className="flex items-start text-muted-foreground text-sm">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-muted-foreground/70 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M9.707 7.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L12 9.586l-2.293-2.293z" />
                                                    </svg>
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>                                      
                                    <SubscribeButton 
                                        priceId={plan.priceId} 
                                        className={`w-full rounded-md ${
                                            selectedPlan === plan.id
                                                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                        }`}
                                    />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    
                    <p className="text-muted-foreground mt-8 text-center">Need help? <a href="#" className="text-primary hover:text-primary/80 font-medium">Contact Support</a></p>
                </div>
            </div>
        </Layout>
    );
}

export default Subscription;