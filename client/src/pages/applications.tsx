import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import TopNavbar from "@/components/top-navbar";
import FilterBar from "@/components/filter-bar";
import ApplicationList from "@/components/application-list";
import AddJobModal from "@/components/add-job-modal";
import ApplicationDetailsModal from "@/components/application-details-modal";
import MobileNav from "@/components/mobile-nav";
import { useApplicationContext } from "@/contexts/application-context";
import { Application } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function Applications() {
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const { 
    selectedApplicationId, 
    setSelectedApplicationId,
    filterStatus,
    filterDateRange,
    searchQuery
  } = useApplicationContext();

  // Fetch applications
  const { data: applications, isLoading } = useQuery<Application[]>({
    queryKey: ['/api/applications'],
  });

  // Filter applications
  const filteredApplications = applications?.filter(app => {
    // Filter by status
    if (filterStatus && filterStatus !== "all" && app.status !== filterStatus) {
      return false;
    }

    // Filter by date range
    if (filterDateRange && filterDateRange !== "all") {
      const appDate = new Date(app.appliedDate);
      const now = new Date();
      
      if (filterDateRange === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        if (appDate < weekAgo) return false;
      } else if (filterDateRange === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(now.getMonth() - 1);
        if (appDate < monthAgo) return false;
      } else if (filterDateRange === 'quarter') {
        const quarterAgo = new Date();
        quarterAgo.setMonth(now.getMonth() - 3);
        if (appDate < quarterAgo) return false;
      }
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const jobTitle = app.jobTitle?.toLowerCase() || '';
      const company = app.company?.toLowerCase() || '';
      const location = app.location?.toLowerCase() || '';
      
      return (
        jobTitle.includes(query) || 
        company.includes(query) || 
        location.includes(query)
      );
    }

    return true;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:pl-64">
        {/* Top Navbar */}
        <TopNavbar openAddJobModal={() => setShowAddJobModal(true)} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-900">Applications</h1>
                <button
                  type="button"
                  onClick={() => setShowAddJobModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Job
                </button>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-8">
              {/* Filter Bar */}
              <FilterBar />

              {/* Applications List */}
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <ApplicationList 
                  applications={filteredApplications || []} 
                  onApplicationClick={(id) => setSelectedApplicationId(id)}
                />
              )}
            </div>
          </div>
        </main>

        {/* Mobile Navigation */}
        <MobileNav />

        {/* Modals */}
        <AddJobModal 
          open={showAddJobModal} 
          onClose={() => setShowAddJobModal(false)} 
        />
        
        <ApplicationDetailsModal 
          open={!!selectedApplicationId} 
          onClose={() => setSelectedApplicationId(null)} 
          applicationId={selectedApplicationId}
        />
      </div>
    </div>
  );
}
