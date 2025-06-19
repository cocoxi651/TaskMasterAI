import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FaChartLine, FaClock, FaProjectDiagram, FaUsers, FaTasks } from "react-icons/fa";

export default function ReportsView() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/analytics/stats"],
  });

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["/api/projects"],
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users"],
  });

  if (statsLoading || projectsLoading || usersLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Reports & Analytics</h1>
        <p className="text-sm text-gray-500">Track performance and progress across projects</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaProjectDiagram className="text-primary text-lg" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats as any)?.activeProjects || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaTasks className="text-green-600 text-lg" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats as any)?.completedTasks || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FaClock className="text-yellow-600 text-lg" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round((stats as any)?.totalHours || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FaUsers className="text-purple-600 text-lg" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Team Members</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats as any)?.teamMembers || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Project Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FaChartLine className="mr-2" />
              Project Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(projects as any[])?.slice(0, 5).map((project: any, index: number) => (
                <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center text-white text-sm font-medium">
                      {project.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{project.name}</p>
                      <p className="text-sm text-gray-500">
                        Created {new Date(project.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">Active</Badge>
                    <div className="text-sm text-gray-500 mt-1">0 tasks</div>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-gray-500">
                  <FaProjectDiagram className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>No projects to display</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Team Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FaUsers className="mr-2" />
              Team Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(users as any[])?.slice(0, 5).map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-sm font-medium">
                      {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">0h</div>
                    <div className="text-xs text-gray-500">This week</div>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-gray-500">
                  <FaUsers className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>No team activity to display</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Status Overview */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Task Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-700 mb-2">0</div>
              <div className="text-sm text-gray-500 mb-2">To Do</div>
              <Progress value={0} className="h-2" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">0</div>
              <div className="text-sm text-gray-500 mb-2">In QA</div>
              <Progress value={0} className="h-2 bg-yellow-100" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{(stats as any)?.completedTasks || 0}</div>
              <div className="text-sm text-gray-500 mb-2">Done</div>
              <Progress value={100} className="h-2 bg-green-100" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}