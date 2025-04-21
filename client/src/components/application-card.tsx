import { Application } from "@shared/schema";
import { format } from "date-fns";
import { Edit, Trash2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type ApplicationCardProps = {
  application: Application;
  onClick: () => void;
};

export default function ApplicationCard({ application, onClick }: ApplicationCardProps) {
  const { toast } = useToast();
  
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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this application?")) {
      deleteApplicationMutation.mutate(application.id);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "applied":
        return "status-applied";
      case "interview":
        return "status-interviewed";
      case "offer":
        return "status-offer";
      case "rejected":
        return "status-rejected";
      default:
        return "status-applied";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "applied":
        return "Applied";
      case "interview":
        return "Interview";
      case "offer":
        return "Offer";
      case "rejected":
        return "Rejected";
      default:
        return "Applied";
    }
  };

  return (
    <li>
      <div className="block hover:bg-gray-50 cursor-pointer" onClick={onClick}>
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <p className="text-sm font-medium text-primary truncate">
                {application.jobTitle}
              </p>
              <div className="ml-2 flex-shrink-0 flex">
                <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(application.status)} text-white`}>
                  {getStatusText(application.status)}
                </p>
              </div>
            </div>
            <div className="ml-2 flex-shrink-0 flex items-center space-x-2">
              <button
                type="button"
                className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500 focus:bg-gray-100 transition ease-in-out duration-150"
                onClick={onClick}
                aria-label="Edit application"
              >
                <Edit className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500 focus:bg-gray-100 transition ease-in-out duration-150"
                onClick={handleDelete}
                aria-label="Delete application"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="mt-2 sm:flex sm:justify-between">
            <div className="sm:flex">
              <p className="flex items-center text-sm text-gray-500">
                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm3 1h2v2H7V5zm2 3H7v2h2V8zm2-3h2v2h-2V5zm2 3h-2v2h2V8z" clipRule="evenodd" />
                </svg>
                <span>{application.company}</span>
              </p>
              {application.location && (
                <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span>{application.location}</span>
                </p>
              )}
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
              <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span>
                Applied on{" "}
                <time dateTime={application.appliedDate.toString()}>
                  {format(new Date(application.appliedDate), "MMM d, yyyy")}
                </time>
              </span>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
