import Layout from "../Layout";
import { RegisterForm } from "@/components/custom-components/auth/RegisterForm";
import { Card, CardContent } from "@/components/ui/card";

const Register = () => {
    return (
        <Layout>
            <div className="flex justify-center items-center h-full w-full px-4">
                <Card className="border border-border shadow-2xl bg-background rounded-2xl overflow-hidden max-w-md w-full">
                    <div className="h-3 w-full bg-gradient-to-r from-blue-600 to-purple-600"></div>
                    
                    <CardContent className="flex flex-col py-8 px-8">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-foreground">Create an Account</h2>
                            <p className="text-muted-foreground text-sm mt-2">
                                Sign up to get started with our service
                            </p>
                        </div>
                        
                        <RegisterForm />
                    </CardContent>
                </Card>
            </div>
        </Layout>
    )
}

export default Register;