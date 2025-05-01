import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/",
    label: "Dashboard",
    icon: "fas fa-tachometer-alt",
  },
  {
    href: "/jobs",
    label: "Jobs",
    icon: "fas fa-briefcase",
  },
  {
    href: "/candidates",
    label: "Candidates",
    icon: "fas fa-users",
  },
  {
    href: "/interviews",
    label: "Interviews",
    icon: "fas fa-calendar-alt",
  },
  {
    href: "/analytics",
    label: "Analytics",
    icon: "fas fa-chart-pie",
  },
  {
    href: "/settings",
    label: "Settings",
    icon: "fas fa-cog",
  },
];

export function Sidebar() {
  const [location] = useLocation();
  
  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-white border-r border-neutral-light">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-neutral-light">
          <h1 className="text-xl font-bold text-primary">TalentTrack</h1>
        </div>
        
        {/* Navigation */}
        <div className="flex flex-col flex-grow px-4 py-4 overflow-y-auto">
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
              >
                <a 
                  className={cn(
                    "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                    location === item.href
                      ? "text-white bg-primary"
                      : "text-neutral-dark hover:bg-neutral-lightest hover:text-neutral-darkest"
                  )}
                >
                  <i className={`mr-3 ${item.icon}`}></i>
                  {item.label}
                </a>
              </Link>
            ))}
          </nav>
          
          {/* User Profile */}
          <div className="pt-4 mt-6 border-t border-neutral-light">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img 
                  className="w-8 h-8 rounded-full" 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                  alt="User profile"
                />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-neutral-darkest">Sarah Johnson</p>
                <p className="text-xs text-neutral-dark">Senior Recruiter</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
