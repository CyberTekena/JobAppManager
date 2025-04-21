import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import TopNavbar from "@/components/top-navbar";
import MobileNav from "@/components/mobile-nav";
import { useApplicationContext } from "@/contexts/application-context";
import { Application, Note } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ApplicationDetailsModal from "@/components/application-details-modal";

export default function Notes() {
  const [searchQuery, setSearchQuery] = useState("");
  const { selectedApplicationId, setSelectedApplicationId } = useApplicationContext();

  // Fetch applications
  const { data: applications, isLoading: appsLoading } = useQuery<Application[]>({
    queryKey: ['/api/applications'],
  });

  // Fetch notes for each application
  const appNotesQueries = useQuery({
    queryKey: ['/api/applications/notes'],
    enabled: !!applications,
    queryFn: async () => {
      if (!applications || applications.length === 0) return {};
      
      const notesPromises = applications.map(app => 
        fetch(`/api/applications/${app.id}/notes`)
          .then(res => res.json())
          .then(notes => ({ appId: app.id, notes }))
      );
      
      const notesResults = await Promise.all(notesPromises);
      
      // Convert to an object with appId as keys
      return notesResults.reduce((acc, { appId, notes }) => {
        acc[appId] = notes;
        return acc;
      }, {} as Record<number, Note[]>);
    }
  });

  const isLoading = appsLoading || appNotesQueries.isLoading;

  // Filter applications and notes based on search query
  const filteredApplicationsWithNotes = applications?.map(app => {
    const appNotes = appNotesQueries.data?.[app.id] || [];
    
    // Filter notes that match the search query
    const filteredNotes = searchQuery 
      ? appNotes.filter(note => 
          note.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : appNotes;
    
    return {
      application: app,
      notes: filteredNotes
    };
  }).filter(item => item.notes.length > 0);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:pl-64">
        {/* Top Navbar */}
        <TopNavbar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-900">Notes</h1>
              </div>
              
              {/* Search Bar */}
              <div className="mt-4">
                <Input
                  type="search"
                  placeholder="Search notes..."
                  className="max-w-md"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredApplicationsWithNotes && filteredApplicationsWithNotes.length > 0 ? (
                <div className="space-y-8">
                  {filteredApplicationsWithNotes.map(({ application, notes }) => (
                    <Card key={application.id} className="shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle>
                          <button 
                            onClick={() => setSelectedApplicationId(application.id)}
                            className="text-primary hover:underline text-left"
                          >
                            {application.jobTitle} at {application.company}
                          </button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {notes.map((note) => (
                            <div key={note.id} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <p className="text-sm text-gray-500">
                                  {format(new Date(note.createdAt), "MMM d, yyyy")}
                                </p>
                              </div>
                              <p className="text-gray-800">{note.content}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No notes found. Add notes to your job applications to see them here.</p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Mobile Navigation */}
        <MobileNav />

        {/* Application Details Modal */}
        <ApplicationDetailsModal 
          open={!!selectedApplicationId} 
          onClose={() => setSelectedApplicationId(null)} 
          applicationId={selectedApplicationId}
        />
      </div>
    </div>
  );
}
