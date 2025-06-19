import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import TaskBoard from "@/components/tasks/task-board";
import TimeLogModal from "@/components/modals/time-log-modal";
import { FaPlus } from "react-icons/fa";

export default function UserDashboard() {
  const { user } = useAuth();
  const [showTimeLog, setShowTimeLog] = useState(false);

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["/api/tasks/user", user?.id],
    enabled: !!user?.id,
  });

  const { data: timeLogs, isLoading: timeLogsLoading } = useQuery({
    queryKey: ["/api/time-logs/user", user?.id],
    enabled: !!user?.id,
  });

  if (tasksLoading || timeLogsLoading) {
    return (
      <div className="ml-64">
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-96 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-64">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Tasks</h1>
          <p className="text-sm text-gray-500">Manage your assigned tasks and log your work hours</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={() => setShowTimeLog(true)} className="flex items-center bg-secondary hover:bg-indigo-700">
            <FaPlus className="mr-2" />
            Log Time
          </Button>
        </div>
      </header>

      <main className="p-6">
        {/* Task Board */}
        <TaskBoard tasks={tasks || []} />

        {/* Recent Time Logs */}
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Time Logs</CardTitle>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {timeLogs?.slice(0, 5).map((log: any) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Task #{log.taskId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Project
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(log.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.hours}h
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {log.notes || "No notes provided"}
                      </td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No time logs yet. Start logging your work hours!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>

      <TimeLogModal 
        open={showTimeLog} 
        onClose={() => setShowTimeLog(false)} 
      />
    </div>
  );
}
