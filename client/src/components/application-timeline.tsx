import { TimelineEvent } from "@shared/schema";
import { format } from "date-fns";
import { 
  CheckCircle, 
  Calendar, 
  MessageSquare, 
  XCircle,
  ListTodo
} from "lucide-react";

type ApplicationTimelineProps = {
  events: TimelineEvent[];
};

export default function ApplicationTimeline({ events }: ApplicationTimelineProps) {
  // Sort events by date, most recent first
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
  );

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "applied":
        return <ListTodo className="h-5 w-5 text-white" />;
      case "interview":
        return <Calendar className="h-5 w-5 text-white" />;
      case "offer":
        return <CheckCircle className="h-5 w-5 text-white" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-white" />;
      default:
        return <MessageSquare className="h-5 w-5 text-white" />;
    }
  };

  const getIconColor = (eventType: string) => {
    switch (eventType) {
      case "applied":
        return "bg-gray-400";
      case "interview":
        return "bg-blue-500";
      case "offer":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  const getEventTitle = (eventType: string) => {
    switch (eventType) {
      case "applied":
        return "Applied to position";
      case "interview":
        return "Interview scheduled";
      case "offer":
        return "Received job offer";
      case "rejected":
        return "Application rejected";
      default:
        return eventType.charAt(0).toUpperCase() + eventType.slice(1);
    }
  };

  return (
    <div className="flow-root">
      <h4 className="text-md font-medium text-gray-900 mb-3">Timeline</h4>
      <ul className="-mb-8">
        {sortedEvents.map((event, index) => (
          <li key={event.id} className="relative timeline-dot pl-6 pb-8">
            <div className="relative flex space-x-3">
              <div>
                <span className={`h-8 w-8 rounded-full ${getIconColor(event.eventType)} flex items-center justify-center ring-8 ring-white`}>
                  {getEventIcon(event.eventType)}
                </span>
              </div>
              <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                <div>
                  <p className="text-sm text-gray-800">{getEventTitle(event.eventType)}</p>
                  {event.description && (
                    <p className="text-xs text-gray-500 mt-1">{event.description}</p>
                  )}
                </div>
                <div className="text-right text-sm whitespace-nowrap text-gray-500">
                  <time dateTime={event.eventDate.toString()}>
                    {format(new Date(event.eventDate), "MMM d, yyyy")}
                  </time>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
