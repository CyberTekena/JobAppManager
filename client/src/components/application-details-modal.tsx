import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Application, Note, TimelineEvent } from "@shared/schema";
import { format } from "date-fns";
import { Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ApplicationTimeline from "./application-timeline";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ApplicationDetailsModalProps = {
  open: boolean;
  onClose: () => void;
  applicationId: number | null;
};

export default function ApplicationDetailsModal({
  open,
  onClose,
  applicationId,
}: ApplicationDetailsModalProps) {
  const [newNote, setNewNote] = useState("");
  const { toast } = useToast();

  // Reset note input when modal closes or application changes
  useEffect(() => {
    if (!open) {
      setNewNote("");
    }
  }, [open, applicationId]);

  const { data: application, isLoading: applicationLoading } = useQuery<Application>({
    queryKey: [`/api/applications/${applicationId}`],
    enabled: open && !!applicationId,
  });

  const { data: notes, isLoading: notesLoading } = useQuery<Note[]>({
    queryKey: [`/api/applications/${applicationId}/notes`],
    enabled: open && !!applicationId,
  });

  const { data: timelineEvents, isLoading: timelineLoading } = useQuery<TimelineEvent[]>({
    queryKey: [`/api/applications/${applicationId}/timeline`],
    enabled: open && !!applicationId,
  });

  const addNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!applicationId) return;
      
      const res = await apiRequest("POST", `/api/applications/${applicationId}/notes`, {
        content,
      });
      return await res.json();
    },
    onSuccess: () => {
      setNewNote("");
      queryClient.invalidateQueries({ queryKey: [`/api/applications/${applicationId}/notes`] });
      toast({
        title: "Note added",
        description: "Your note has been successfully added",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      if (!applicationId) return;
      
      const res = await apiRequest("PATCH", `/api/applications/${applicationId}`, {
        status,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/applications/${applicationId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/applications/${applicationId}/timeline`] });
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

  const handleAddNote = () => {
    if (newNote.trim()) {
      addNoteMutation.mutate(newNote);
    }
  };

  const handleStatusChange = (status: string) => {
    updateStatusMutation.mutate(status);
  };

  const isLoading = applicationLoading || notesLoading || timelineLoading;

  // Status badge styles
  const getStatusClass = (status: string) => {
    switch (status) {
      case "applied":
        return "bg-gray-500";
      case "interview":
        return "bg-amber-500";
      case "offer":
        return "bg-emerald-500";
      case "rejected":
        return "bg-red-500";
      default:
        return "bg-gray-500";
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
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : application ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg font-medium">
                {application.jobTitle}
              </DialogTitle>
              <div className="mt-2 flex items-center">
                <p className="text-sm text-gray-500">{application.company}</p>
                {application.location && (
                  <>
                    <span className="mx-2 text-gray-300">•</span>
                    <p className="text-sm text-gray-500">{application.location}</p>
                  </>
                )}
                <span className="mx-2 text-gray-300">•</span>
                <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(application.status)} text-white`}>
                  {getStatusText(application.status)}
                </p>
              </div>
            </DialogHeader>

            <div className="mt-5">
              <div className="flex space-x-3 mb-4">
                <div className="w-48">
                  <Select
                    value={application.status}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Update Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="applied">Applied</SelectItem>
                      <SelectItem value="interview">Interview</SelectItem>
                      <SelectItem value="offer">Offer</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Timeline */}
              {timelineEvents && timelineEvents.length > 0 && (
                <ApplicationTimeline events={timelineEvents} />
              )}

              {/* Notes */}
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">Notes</h4>
                <div className="bg-gray-50 rounded-lg px-4 py-3">
                  <div className="space-y-4">
                    {notes && notes.length > 0 ? (
                      notes.map((note) => (
                        <div key={note.id}>
                          <div className="flex justify-between">
                            <h5 className="text-sm font-medium text-gray-900">Note</h5>
                            <span className="text-xs text-gray-500">
                              {format(new Date(note.createdAt), "MMM d, yyyy")}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{note.content}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No notes yet. Add your first note below.</p>
                    )}
                  </div>

                  <div className="mt-4">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleAddNote();
                      }}
                    >
                      <Textarea
                        rows={3}
                        placeholder="Add a note..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                      />
                      <div className="mt-3 flex justify-end">
                        <Button 
                          type="submit" 
                          disabled={addNoteMutation.isPending || !newNote.trim()}
                        >
                          {addNoteMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Save Note"
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <p>Application not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
