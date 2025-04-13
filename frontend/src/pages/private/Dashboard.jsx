import { Card } from "@/components/ui/card";
import Layout from "../Layout";

const Dashboard = () => {
    return (
        <Layout>
            <Card className="w-full h-full p-4 flex flex-col gap-4">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">This is your dashboard.</p>
                <p className="text-muted-foreground">You can add more content here.</p>
            </Card>
        </Layout>
    )
}

export default Dashboard;