import Header from "@/components/Header";

const Layout = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8 md:py-16 flex items-center justify-center dark:bg-background">
                {children}
            </main>
        </div>
    );
}
export default Layout;