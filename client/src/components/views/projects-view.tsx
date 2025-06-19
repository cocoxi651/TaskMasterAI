import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import CreateProjectModal from "@/components/modals/create-project-modal";
import { FaPlus, FaUsers, FaTasks, FaClock } from "react-icons/fa";

export default function ProjectsView() {
  const { user } = useAuth();
  const [showCreateProject, setShowCreateProject] = useState(false);

  const { data: projects, isLoading } = useQuery({
    queryKey: ["/api/projects"],
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500">Manage and oversee all active projects</p>
        </div>
        {user?.role === "admin" && (
          <Button onClick={() => setShowCreateProject(true)} className="flex items-center">
            <FaPlus className="mr-2" />
            New Project
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(projects as any[])?.map((project: any) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{project.name}</CardTitle>
                <Badge variant="secondary">Active</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {project.description || "No description provided"}
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <FaTasks className="mr-2" />
                  <span>Tasks: 0</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <FaUsers className="mr-2" />
                  <span>Members: 1</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <FaClock className="mr-2" />
                  <span>Hours: 0</span>
                </div>
              </div>

              {project.dueDate && (
                <div className="text-xs text-gray-500 mb-3">
                  Due: {new Date(project.dueDate).toLocaleDateString()}
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </span>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        )) || (
          <div className="col-span-full text-center py-12">
            <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FaTasks className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-500 mb-4">
              Get started by creating your first project
            </p>
            {user?.role === "admin" && (
              <Button onClick={() => setShowCreateProject(true)}>
                Create Project
              </Button>
            )}
          </div>
        )}
      </div>

      <CreateProjectModal 
        open={showCreateProject} 
        onClose={() => setShowCreateProject(false)} 
      />
    </div>
  );
}