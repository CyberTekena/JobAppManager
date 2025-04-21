import { createContext, ReactNode, useContext, useState } from "react";
import { Application } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type ApplicationContextType = {
  // Application selection
  selectedApplicationId: number | null;
  setSelectedApplicationId: (id: number | null) => void;
  
  // Filtering
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  filterDateRange: string;
  setFilterDateRange: (range: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Application actions
  deleteApplication: (id: number) => void;
  updateApplicationStatus: (id: number, status: string) => void;
};

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export function ApplicationProvider({ children }: { children: ReactNode }) {
  // Application selection state
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);
  
  // Filtering state
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDateRange, setFilterDateRange] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { toast } = useToast();

  // Mutation for deleting applications
  const deleteApplicationMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/applications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Application deleted",
        description: "The job application has been successfully deleted",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete the application",
        variant: "destructive",
      });
    },
  });

  // Mutation for updating application status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/applications/${id}`, {
        status,
      });
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/applications/${variables.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/applications/${variables.id}/timeline`] });
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Status updated",
        description: "Application status has been updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    },
  });

  // Function to delete an application
  const deleteApplication = (id: number) => {
    if (confirm("Are you sure you want to delete this application?")) {
      deleteApplicationMutation.mutate(id);
      // If the deleted application is selected, clear the selection
      if (selectedApplicationId === id) {
        setSelectedApplicationId(null);
      }
    }
  };

  // Function to update an application's status
  const updateApplicationStatus = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const value = {
    selectedApplicationId,
    setSelectedApplicationId,
    filterStatus,
    setFilterStatus,
    filterDateRange,
    setFilterDateRange,
    searchQuery,
    setSearchQuery,
    deleteApplication,
    updateApplicationStatus,
  };

  return (
    <ApplicationContext.Provider value={value}>
      {children}
    </ApplicationContext.Provider>
  );
}

export function useApplicationContext() {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error("useApplicationContext must be used within an ApplicationProvider");
  }
  return context;
}
