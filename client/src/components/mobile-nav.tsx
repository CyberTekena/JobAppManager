import { Link, useLocation } from "wouter";
import { HomeIcon, ClipboardListIcon, PlusIcon, BarChartIcon } from "lucide-react";

export default function MobileNav() {
  const [location] = useLocation();
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="flex justify-around">
        <Link
          href="/"
          className={`flex flex-col items-center py-2 ${location === '/' ? 'text-primary' : 'text-gray-600'}`}
        >
          <HomeIcon className="h-6 w-6" />
          <span className="text-xs">Dashboard</span>
        </Link>
        <Link
          href="/applications"
          className={`flex flex-col items-center py-2 ${location === '/applications' ? 'text-primary' : 'text-gray-600'}`}
        >
          <ClipboardListIcon className="h-6 w-6" />
          <span className="text-xs">Applications</span>
        </Link>
        <Link
          href="/add"
          className="flex flex-col items-center py-2 text-gray-600"
          onClick={(e) => {
            e.preventDefault();
            // This would trigger the add job modal from the parent component
            // For this example, we'll rely on the button in the UI
          }}
        >
          <PlusIcon className="h-6 w-6" />
          <span className="text-xs">Add</span>
        </Link>
        <Link
          href="/analytics"
          className={`flex flex-col items-center py-2 ${location === '/analytics' ? 'text-primary' : 'text-gray-600'}`}
        >
          <BarChartIcon className="h-6 w-6" />
          <span className="text-xs">Analytics</span>
        </Link>
      </div>
    </div>
  );
}
