import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

// Common navigation items for all users
const commonNavItems = [
  {
    href: "/",
    label: "Dashboard",
    icon: "fas fa-tachometer-alt",
  },
  {
    href: "/settings",
    label: "Settings",
    icon: "fas fa-cog",
  },
];

// Navigation items only for recruiters
const recruiterNavItems = [
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
];

// Navigation items only for candidates
const candidateNavItems = [
  {
    href: "/my-applications",
    label: "My Applications",
    icon: "fas fa-file-alt",
  },
  {
    href: "/job-search",
    label: "Find Jobs",
    icon: "fas fa-search",
  },
];

// Navigation items only for admins
const adminNavItems = [
  {
    href: "/admin/users",
    label: "Manage Users",
    icon: "fas fa-user-shield",
  },
  {
    href: "/admin/activities",
    label: "Activity Log",
    icon: "fas fa-history",
  },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  
  // Determine which navigation items to show based on user role
  const getNavItems = () => {
    const items = [...commonNavItems];
    
    if (user?.role === "recruiter") {
      // Add recruiter-specific items after the Dashboard item
      items.splice(1, 0, ...recruiterNavItems);
    } else if (user?.role === "candidate") {
      // Add candidate-specific items after the Dashboard item
      items.splice(1, 0, ...candidateNavItems);
    } else if (user?.role === "admin") {
      // Add admin-specific items after the Dashboard item
      items.splice(1, 0, ...adminNavItems);
      // Admin can also access recruiter pages
      items.splice(3, 0, ...recruiterNavItems);
    }
    
    return items;
  };
  
  const navItems = getNavItems();
  
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
                  src={user?.profileImage || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user?.fullName || "User")} 
                  alt={user?.fullName || "User profile"}
                />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-neutral-darkest">{user?.fullName}</p>
                <p className="text-xs text-neutral-dark capitalize">{user?.role} {user?.position ? `- ${user.position}` : ''}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
