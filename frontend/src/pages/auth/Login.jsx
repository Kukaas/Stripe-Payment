import Layout from "../Layout";
import { LoginForm } from "@/components/custom-components/auth/LoginForm";
import { Card, CardContent } from "@/components/ui/card";

const Login = () => {
    return (
        <Layout>
            <div className="flex justify-center items-center h-full w-full px-4">
                <Card className="border border-border shadow-2xl bg-background rounded-2xl overflow-hidden max-w-md w-full">
                    <div className="h-3 w-full bg-gradient-to-r from-blue-600 to-purple-600"></div>
                    
                    <CardContent className="flex flex-col py-8 px-8">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-foreground">Welcome Back</h2>
                            <p className="text-muted-foreground text-sm mt-2">
                                Sign in to your account to continue
                            </p>
                        </div>
                        
                        <LoginForm />
                    </CardContent>
                </Card>
            </div>
        </Layout>
    )
}

export default Login;