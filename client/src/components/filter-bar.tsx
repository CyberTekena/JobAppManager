import { useApplicationContext } from "@/contexts/application-context";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function FilterBar() {
  const { 
    filterStatus, 
    setFilterStatus,
    filterDateRange,
    setFilterDateRange,
    setSearchQuery
  } = useApplicationContext();

  const clearFilters = () => {
    setFilterStatus("all");
    setFilterDateRange("all");
    setSearchQuery("");
  };

  return (
    <div className="bg-white shadow rounded-lg mt-5 p-4">
      <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
        <div className="w-full md:w-48">
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <Select 
            value={filterStatus} 
            onValueChange={setFilterStatus}
          >
            <SelectTrigger id="status-filter" className="mt-1">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="interview">Interview</SelectItem>
              <SelectItem value="offer">Offer</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-auto">
          <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700">
            Date Range
          </label>
          <Select 
            value={filterDateRange} 
            onValueChange={setFilterDateRange}
          >
            <SelectTrigger id="date-filter" className="mt-1">
              <SelectValue placeholder="All Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="week">Past Week</SelectItem>
              <SelectItem value="month">Past Month</SelectItem>
              <SelectItem value="quarter">Past 3 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button
            type="button"
            variant="outline"
            className="py-2 px-4"
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
