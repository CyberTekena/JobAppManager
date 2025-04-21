import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { 
  HomeIcon, 
  ClipboardListIcon, 
  MessageSquareTextIcon, 
  BarChartIcon,
  LogOutIcon
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Function to get initials from username or name
  const getInitials = () => {
    if (user?.name) {
      return user.name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    
    return user?.username.substring(0, 2).toUpperCase() || "U";
  };

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-grow bg-white pt-5 border-r border-gray-200 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4 mb-8">
          <span className="text-2xl font-semibold text-primary">JobTrack</span>
        </div>
        <div className="mt-5 flex-grow flex flex-col">
          <nav className="flex-1 px-2 space-y-1">
            <Link 
              href="/" 
              className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                location === '/' 
                  ? 'bg-indigo-50 text-primary' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <HomeIcon className="mr-4 h-6 w-6" />
              Dashboard
            </Link>
            <Link 
              href="/applications" 
              className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                location === '/applications' 
                  ? 'bg-indigo-50 text-primary' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <ClipboardListIcon className="mr-4 h-6 w-6" />
              Applications
            </Link>
            <Link 
              href="/notes" 
              className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                location === '/notes' 
                  ? 'bg-indigo-50 text-primary' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <MessageSquareTextIcon className="mr-4 h-6 w-6" />
              Notes
            </Link>
            <Link 
              href="/analytics" 
              className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                location === '/analytics' 
                  ? 'bg-indigo-50 text-primary' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <BarChartIcon className="mr-4 h-6 w-6" />
              Analytics
            </Link>
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex-shrink-0 w-full group block">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div>
                  <Avatar>
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {user?.name || user?.username}
                  </p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none"
                aria-label="Logout"
              >
                <LogOutIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
