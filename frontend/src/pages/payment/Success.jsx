import Layout from "../Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Success = () => {
  return (
    <Layout>
      <div className="flex justify-center items-center h-full w-full px-4">        
        <Card className="border border-border shadow-2xl bg-background rounded-2xl overflow-hidden max-w-md w-full">
          <div className="h-3 w-full bg-gradient-to-r from-green-500 to-teal-500"></div>
          
          <CardContent className="flex flex-col items-center py-8 px-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold mb-4 text-foreground">Payment Successful!</h2>
            
            <p className="text-muted-foreground mb-4 text-center">
              Thank you for your payment! Your subscription has been activated and you now have full access to all features.
            </p>
            
            <p className="text-muted-foreground/80 mb-8 text-center text-sm">
              A confirmation email has been sent to your registered email address with all the details.
            </p>              <Button 
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 transition-all duration-300 text-white"
              onClick={() => window.location.href = '/'}
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}


export default Success;