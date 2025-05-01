import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };
  
  const handleNotificationClick = () => {
    toast({
      title: "Notifications",
      description: "You have no new notifications",
    });
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
          
          <Button 
            variant="ghost"
            size="icon"
            className="flex md:hidden items-center p-0"
          >
            <img 
              className="w-8 h-8 rounded-full" 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
              alt="User profile" 
            />
          </Button>
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
