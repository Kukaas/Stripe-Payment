import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { publicMenu, userMenu } from "@/lib/menu";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ModeToggle } from "./ThemeToggle";
import { useAuth } from "@/lib/hooks/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { toast } from "sonner";
import { logoutUser } from "@/lib/hooks/api/authApi";
import { User, LogOut, Menu } from "lucide-react";

const Header = () => {
    const {user, setUser} = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
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

    const handleLogout = async (e) => {
        setLoading(true);
        e.preventDefault(); 
        e.stopPropagation();    

        try {
            const res = await logoutUser(); 
            if (res.status === 200) {
                setUser(null); 
                navigate("/login");
                toast.success("Logout successful!");
            }
        } catch (error) {
            toast.error("Logout failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }

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
                        {!user ? publicMenu.map((link, index) => (
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
                        )) : (
                            userMenu.map((link, index) => (
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
                            ))
                        )}
                    </ul>                    
                    {user && (
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden border-2 border-border/30 hover:border-primary/50 transition-all">
                            <Avatar className="h-full w-full transition-transform duration-300 hover:scale-105">
                                <AvatarImage src={user?.photo?.data} alt={user?.name} className="object-cover" />
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                    {user?.name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></span>
                        </Button>
                        </DropdownMenuTrigger>                        
                        <DropdownMenuContent className="w-64 overflow-hidden rounded-lg border border-border/50 shadow-lg animate-in fade-in-80 zoom-in-95">
                            <div className="p-4 bg-muted/30">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9 flex-shrink-0 border-2 border-background">
                                        <AvatarImage src={user?.photo?.data} alt={user?.name} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                            {user?.name?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col overflow-hidden">
                                        <h2 className="text-sm font-semibold text-foreground truncate">{user?.name}</h2>
                                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                                    </div>
                                </div>
                            </div>
                            <DropdownMenuSeparator />
                            <div className="p-1">
                                <DropdownMenuItem className="cursor-pointer rounded-md hover:bg-muted focus:bg-muted transition-colors px-3 py-2">
                                    <Link to="/profile" className="w-full flex items-center gap-2">
                                        <User className="text-inherit flex-shrink-0" size={16} />
                                        <span className="font-medium text-sm">Profile</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    className="cursor-pointer rounded-md hover:bg-destructive/10 focus:bg-destructive/10 hover:text-destructive focus:text-destructive transition-colors px-3 py-2 mt-1" 
                                    onClick={handleLogout}
                                >
                                    <LogOut className="text-inherit flex-shrink-0" size={16} />
                                    <span className="ml-2">{loading ? "Logging out..." : "Logout"}</span>
                                </DropdownMenuItem>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    )}
                    <ModeToggle />

                </div>
            </nav>
                  {/* Mobile Navigation - Burger Menu */}
            <div className="md:hidden flex items-center gap-4">            
                {user && (
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 overflow-hidden border-2 border-border/30 hover:border-primary/50 transition-all">
                                <Avatar className="h-full w-full transition-transform duration-300 hover:scale-105">
                                    <AvatarImage src={user?.photo?.data} alt={user?.name} className="object-cover" />
                                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                        {user?.name?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full"></span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-60 overflow-hidden rounded-lg border border-border/50 shadow-lg animate-in fade-in-80 zoom-in-95">
                            <div className="p-4 bg-muted/30">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9 flex-shrink-0 border-2 border-background">
                                        <AvatarImage src={user?.photo?.data} alt={user?.name} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                            {user?.name?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col overflow-hidden">
                                        <h2 className="text-sm font-semibold text-foreground truncate">{user?.name}</h2>
                                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                                    </div>
                                </div>
                            </div>
                            <DropdownMenuSeparator />
                            <div className="p-1">
                                <DropdownMenuItem className="cursor-pointer rounded-md hover:bg-muted focus:bg-muted transition-colors px-3 py-2">
                                    <Link to="/profile" className="w-full flex items-center gap-2">
                                        <User className="text-inherit flex-shrink-0" size={16} />
                                        <span className="font-medium text-sm">Profile</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    className="cursor-pointer rounded-md hover:bg-destructive/10 focus:bg-destructive/10 hover:text-destructive focus:text-destructive transition-colors px-3 py-2 mt-1" 
                                    onClick={handleLogout}
                                >
                                    <LogOut className="text-inherit flex-shrink-0" size={16} />
                                    <span className="ml-2">{loading ? "Logging out..." : "Logout"}</span>
                                </DropdownMenuItem>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    )}
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
                                        {!user ? publicMenu.map((link, index) => (
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
                                        )): (
                                            userMenu.map((link, index) => (
                                                <li key={index}>
                                                    <Link
                                                        to={link.href}
                                                        onClick={() => setIsOpen(false)}
                                                        className={`block py-1 transition-colors text-lg ${
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
                                            ))
                                        )}
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

