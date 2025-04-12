import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { publicMenu } from "@/lib/menu";
import { Link, useLocation } from "react-router-dom";
import { ModeToggle } from "./ThemeToggle";

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    
    // Function to check if the menu item is active
    const isActive = (path) => {
        // Exact match for root path
        if (path === "/" && location.pathname === "/") {
            return true;
        }
        // For other paths, check if current location starts with the path
        // But we need to ensure we're matching complete path segments
        if (path !== "/") {
            const pathWithSlash = path.endsWith("/") ? path : `${path}/`;
            return location.pathname === path || 
                   location.pathname.startsWith(pathWithSlash) ||
                   (location.pathname.startsWith(path) && 
                    (location.pathname.length === path.length || location.pathname[path.length] === "/"));
        }
        return false;
    };

    return (          
    <header className="bg-background border-b border-border sticky top-0 z-10">
        <div className="container mx-auto py-3 px-4 flex justify-between items-center">
            <h1 className="text-xl font-medium text-foreground">
                Stripe Payment                
            </h1>               
            {/* Desktop Navigation */}                
            <nav className="hidden md:block">
                <div className="flex items-center space-x-8">
                    <ul className="flex space-x-8">
                        {publicMenu.map((link, index) => (
                            <li key={index}>
                                <Link 
                                    to={link.href}
                                        className={`relative py-2.5 px-1 text-sm tracking-wide transition-colors outline-none ${
                                        isActive(link.href) 
                                                ? "text-foreground font-medium" 
                                                : "text-muted-foreground hover:text-foreground/80"
                                    }`}
                                >
                                    {link.label}
                                    {isActive(link.href) && (
                                        <span className="absolute bottom-0 left-0 w-full h-[2px] bg-foreground"></span>
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <ModeToggle />
                </div>
            </nav>
                
            {/* Mobile Navigation - Burger Menu */}
            <div className="md:hidden flex items-center gap-4">
                <ModeToggle />
                <Sheet open={isOpen} onOpenChange={setIsOpen}>                         
                    <SheetTrigger asChild>
                        <button 
                            className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                            aria-label="Menu"
                        >
                            <div className="w-6 flex flex-col gap-1.5">
                                <span className={`block h-0.5 w-full bg-gray-600 dark:bg-gray-400 transition-all duration-300 {isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                                <span className={`block h-0.5 w-full bg-gray-600 dark:bg-gray-400 transition-all duration-300 {isOpen ? 'opacity-0' : ''}`}></span>
                                <span className={`block h-0.5 w-full bg-gray-600 dark:bg-gray-400 transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                            </div>
                        </button>
                    </SheetTrigger>                          
                    <SheetContent side="right" className="w-[400px] sm:w-[400px] p-0 border-l">                            
                        <div className="py-10 px-6">
                            <h2 className="mb-10 text-2xl font-medium text-foreground">
                                Stripe Payment
                            </h2>
                                <nav>
                                    <ul className="space-y-7">
                                        {publicMenu.map((link, index) => (
                                            <li key={index}>                                                <Link
                                                    to={link.href}
                                                    onClick={() => setIsOpen(false)}
                                                    className={`block py-1   transition-colors text-lg ${
                                                        isActive(link.href) 
                                                            ? "text-foreground font-medium" 
                                                            : "text-muted-foreground hover:text-foreground/80"
                                                    }`}
                                                >
                                                    {link.label}
                                                    {isActive(link.href) && (
                                                        <span className="inline-block ml-2 w-1 h-1 rounded-full bg-foreground"></span>
                                                    )}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>                                    
                                </nav>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}

export default Header;

