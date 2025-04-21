import { Application } from "@shared/schema";
import ApplicationCard from "./application-card";

type ApplicationListProps = {
  applications: Application[];
  onApplicationClick: (id: number) => void;
};

export default function ApplicationList({ applications, onApplicationClick }: ApplicationListProps) {
  if (applications.length === 0) {
    return (
      <div className="mt-5">
        <h2 className="text-lg font-medium text-gray-900 mb-3">Your Applications</h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
          <p className="text-gray-500">No applications found. Add your first job application!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5">
      <h2 className="text-lg font-medium text-gray-900 mb-3">Your Applications</h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {applications.map((application) => (
            <ApplicationCard 
              key={application.id} 
              application={application} 
              onClick={() => onApplicationClick(application.id)} 
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
