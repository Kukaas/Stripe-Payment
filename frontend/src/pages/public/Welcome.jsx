// filepath: c:\Users\Mark\Documents\GitHub\lukas\Stripe\frontend\src\pages\public\Welcome.jsx
import Layout from "../Layout";
import { Button } from "@/components/ui/button";

const Welcome = () => {
    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 py-16 md:py-24">                
                <div className="flex flex-col items-center">
                    <h1 className="text-4xl md:text-5xl font-medium mb-6 text-foreground text-center">
                        Simplified payment solutions for modern businesses
                    </h1>
                    
                    <p className="text-muted-foreground mb-12 text-center text-base md:text-lg max-w-2xl">
                        Stripe Payment helps you manage subscriptions, process payments, and grow your business with minimal effort.
                    </p>
                      <div className="flex flex-col sm:flex-row gap-4 mb-16">
                        <Button 
                            size="lg"
                            className="px-8 py-6 text-base"
                            onClick={() => window.location.href = '/payment'}
                        >
                            Get Started
                        </Button>
                        <Button 
                            variant="outline"
                            size="lg"
                            className="px-8 py-6 text-base"
                            onClick={() => window.location.href = '/login'}
                        >
                            Sign In
                        </Button>
                    </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full border-t border-border pt-16">
                        <div>
                            <h3 className="text-base font-medium mb-3 text-foreground">Simplified Payments</h3>
                            <p className="text-muted-foreground text-sm">
                                Streamlined checkout processes for both one-time and subscription payments.
                            </p>
                        </div>
                        
                        <div>
                            <h3 className="text-base font-medium mb-3 text-foreground">Secure Transactions</h3>
                            <p className="text-muted-foreground text-sm">
                                Bank-level security ensuring your customers' data is always protected.
                            </p>
                        </div>
                        
                        <div>
                            <h3 className="text-base font-medium mb-3 text-foreground">Advanced Analytics</h3>
                            <p className="text-muted-foreground text-sm">
                                Detailed insights into your payment flows and customer behavior.
                            </p>
                        </div>
                    </div>
                      <div className="mt-20 w-full">
                        <div className="flex flex-col md:flex-row justify-between items-center border-b border-border pb-6 mb-10">
                            <h2 className="text-xl font-medium text-foreground mb-4 md:mb-0">Plans starting at just $3.99/month</h2>
                            <Button 
                                variant="outline"
                                onClick={() => window.location.href = '/payment'}
                            >
                                Compare Plans
                            </Button>
                        </div>
                        
                        <div className="flex flex-col md:flex-row justify-between gap-8 text-sm text-muted-foreground">
                            <p>30-day money back guarantee</p>
                            <p>No credit card required to start</p>
                            <p>Cancel anytime with no penalties</p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default Welcome;