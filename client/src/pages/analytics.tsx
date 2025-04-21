import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import TopNavbar from "@/components/top-navbar";
import MobileNav from "@/components/mobile-nav";
import { Loader2 } from "lucide-react";
import { Application } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PieChart, 
  Pie, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from "date-fns";

export default function Analytics() {
  // Fetch applications
  const { data: applications, isLoading } = useQuery<Application[]>({
    queryKey: ['/api/applications'],
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
  });

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col md:pl-64">
          <TopNavbar />
          <main className="flex-1 overflow-y-auto">
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </main>
          <MobileNav />
        </div>
      </div>
    );
  }

  // Status distribution data for pie chart
  const statusData = [
    { name: 'Applied', value: stats?.applied || 0, color: '#6B7280' },
    { name: 'Interview', value: stats?.interview || 0, color: '#F59E0B' },
    { name: 'Offer', value: stats?.offer || 0, color: '#10B981' },
    { name: 'Rejected', value: stats?.rejected || 0, color: '#EF4444' }
  ];

  // Monthly applications data
  const getMonthlyApplicationData = () => {
    if (!applications || applications.length === 0) return [];
    
    const sixMonthsAgo = subMonths(new Date(), 5);
    const months = eachMonthOfInterval({
      start: startOfMonth(sixMonthsAgo),
      end: endOfMonth(new Date())
    });
    
    return months.map(month => {
      const monthStr = format(month, 'MMM yyyy');
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const applied = applications.filter(app => {
        const appDate = new Date(app.appliedDate);
        return appDate >= monthStart && appDate <= monthEnd;
      }).length;
      
      return {
        name: monthStr,
        Applications: applied
      };
    });
  };

  const monthlyData = getMonthlyApplicationData();

  // Response rate calculation
  const totalApplications = stats?.total || 0;
  const totalResponses = (stats?.interview || 0) + (stats?.offer || 0) + (stats?.rejected || 0);
  const responseRate = totalApplications > 0 
    ? Math.round((totalResponses / totalApplications) * 100) 
    : 0;

  // Success rate calculation
  const successRate = totalApplications > 0 
    ? Math.round(((stats?.offer || 0) / totalApplications) * 100) 
    : 0;

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
              <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-8">
              {/* Stats Summary */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Total Applications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-primary">{stats?.total || 0}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Response Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-primary">{responseRate}%</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Success Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-primary">{successRate}%</p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Status Distribution Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Application Status</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Monthly Applications Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Applications Per Month</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={monthlyData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Applications" fill="#4F46E5" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>

        {/* Mobile Navigation */}
        <MobileNav />
      </div>
    </div>
  );
}
