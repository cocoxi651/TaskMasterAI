import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import CreateProjectModal from "@/components/modals/create-project-modal";
import ProjectsView from "@/components/views/projects-view";
import TasksView from "@/components/views/tasks-view";
import UsersView from "@/components/views/users-view";
import ReportsView from "@/components/views/reports-view";
import { 
  FaProjectDiagram, 
  FaCheckCircle, 
  FaClock, 
  FaUsers, 
  FaBell,
  FaPlus 
} from "react-icons/fa";

interface AdminDashboardProps {
  activeView?: string;
  onViewChange?: (view: string) => void;
}

export default function AdminDashboard({ activeView = "dashboard", onViewChange }: AdminDashboardProps) {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/analytics/stats"],
  });

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["/api/projects"],
  });

  if (statsLoading || projectsLoading) {
    return (
      <div className="ml-64">
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeView) {
      case "projects":
        return <ProjectsView />;
      case "tasks":
        return <TasksView />;
      case "users":
        return <UsersView />;
      case "reports":
        return <ReportsView />;
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <main className="p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaProjectDiagram className="text-primary text-lg" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
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
                <FaCheckCircle className="text-green-600 text-lg" />
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
                <p className="text-sm font-medium text-gray-600">Hours This Month</p>
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
        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Projects</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onViewChange?.("projects")}>View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(projects as any)?.slice(0, 3).map((project: any) => (
                <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center text-white text-sm font-medium">
                      {project.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{project.name}</p>
                      <p className="text-xs text-gray-500">
                        {project.description || "No description"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">Active</Badge>
                    <span className="text-xs text-gray-500">100%</span>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-gray-500">
                  <FaProjectDiagram className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>No projects yet</p>
                  <p className="text-sm">Create your first project to get started</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Team Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Team Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                <FaClock className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p>No recent activity</p>
                <p className="text-sm">Activity will appear here as team members work on tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );

  return (
    <div className="ml-64">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {activeView === "dashboard" ? "Dashboard" : 
             activeView === "projects" ? "Projects" :
             activeView === "tasks" ? "Tasks" :
             activeView === "users" ? "Team" : "Reports"}
          </h1>
          <p className="text-sm text-gray-500">
            {activeView === "dashboard" ? "Welcome back, manage your projects efficiently" :
             activeView === "projects" ? "Manage and oversee all active projects" :
             activeView === "tasks" ? "Manage tasks across all projects" :
             activeView === "users" ? "Manage your team and user permissions" : "Track performance and progress"}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-400 hover:text-gray-600 relative">
            <FaBell className="text-lg" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
              3
            </span>
          </button>
        </div>
      </header>

      {renderActiveView()}
    </div>
  );
}
