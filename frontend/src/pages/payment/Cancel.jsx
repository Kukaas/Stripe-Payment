import Layout from "../Layout"
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Cancel = () => {
    return (
        <Layout>            
            <div className="flex justify-center items-center h-full w-full px-4">                
                <Card className="border border-border shadow-2xl bg-background rounded-2xl overflow-hidden max-w-md w-full">
                    <div className="h-3 w-full bg-gradient-to-r from-red-500 to-orange-500"></div>
                    
                    <CardContent className="flex flex-col items-center py-8 px-8">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        
                        <h2 className="text-2xl font-bold mb-4 text-foreground">Payment Cancelled</h2>
                        
                        <p className="text-muted-foreground mb-8 text-center">
                            Your payment has been cancelled. If you have any questions or need assistance, please contact our support team.
                        </p>
                          <div className="flex flex-col sm:flex-row gap-4 w-full">
                            <Button 
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 rounded-xl shadow-lg hover:shadow-blue-300/30 w-full text-white"
                                onClick={() => window.location.href = '/'}
                            >
                                Return to Home
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    )
}

export default Cancel