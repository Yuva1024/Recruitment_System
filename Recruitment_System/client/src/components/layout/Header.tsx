import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Settings } from "lucide-react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  const { user, logoutMutation } = useAuth();
  const [_, setLocation] = useLocation();
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };
  
  const handleNotificationClick = () => {
    toast({
      title: "Notifications",
      description: "You have no new notifications",
    });
  };
  
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setLocation("/auth");
      }
    });
  };
  
  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user || !user.fullName) return "U";
    
    return user.fullName
      .split(" ")
      .map(name => name[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <header className="bg-white border-b border-neutral-light">
      <div className="flex justify-between items-center px-4 py-3">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="p-2 text-neutral-dark md:hidden"
          onClick={toggleMobileMenu}
        >
          <i className="fas fa-bars"></i>
        </Button>
        
        {/* Search */}
        <div className="hidden md:block flex-1 max-w-lg ml-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <i className="text-neutral-medium fas fa-search"></i>
            </div>
            <Input 
              type="text" 
              className="block w-full pl-10 pr-3 py-2 border border-neutral-light rounded-md leading-5 bg-neutral-lightest focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light sm:text-sm" 
              placeholder="Search candidates, jobs, etc..." 
            />
          </div>
        </div>
        
        {/* Right Navigation */}
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon"
            className="p-2 text-neutral-dark rounded-md hover:bg-neutral-lightest hover:text-neutral-darkest"
            onClick={handleNotificationClick}
          >
            <i className="fas fa-bell"></i>
          </Button>
          
          <Button 
            variant="ghost"
            size="icon"
            className="p-2 text-neutral-dark rounded-md hover:bg-neutral-lightest hover:text-neutral-darkest md:hidden"
          >
            <i className="fas fa-search"></i>
          </Button>
          
          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.profileImage || ""} alt={user?.fullName || "User"} />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.fullName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground mt-1 capitalize">
                    {user?.role}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <div className="flex items-center w-full cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} disabled={logoutMutation.isPending}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>{logoutMutation.isPending ? "Logging out..." : "Log out"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link href="/">
              <a className="block px-3 py-2 text-base font-medium text-white bg-primary rounded-md">
                Dashboard
              </a>
            </Link>
            <Link href="/jobs">
              <a className="block px-3 py-2 text-base font-medium text-neutral-dark hover:bg-neutral-lightest hover:text-neutral-darkest rounded-md">
                Jobs
              </a>
            </Link>
            <Link href="/candidates">
              <a className="block px-3 py-2 text-base font-medium text-neutral-dark hover:bg-neutral-lightest hover:text-neutral-darkest rounded-md">
                Candidates
              </a>
            </Link>
            <Link href="/interviews">
              <a className="block px-3 py-2 text-base font-medium text-neutral-dark hover:bg-neutral-lightest hover:text-neutral-darkest rounded-md">
                Interviews
              </a>
            </Link>
            <Link href="/analytics">
              <a className="block px-3 py-2 text-base font-medium text-neutral-dark hover:bg-neutral-lightest hover:text-neutral-darkest rounded-md">
                Analytics
              </a>
            </Link>
            <Link href="/settings">
              <a className="block px-3 py-2 text-base font-medium text-neutral-dark hover:bg-neutral-lightest hover:text-neutral-darkest rounded-md">
                Settings
              </a>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
