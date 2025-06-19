import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import TaskBoard from "@/components/tasks/task-board";
import { FaPlus, FaSearch } from "react-icons/fa";

export default function TasksView() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["/api/tasks"],
  });

  const { data: projects } = useQuery({
    queryKey: ["/api/projects"],
    enabled: showCreateTask,
  });

  const { data: users } = useQuery({
    queryKey: ["/api/users"],
    enabled: showCreateTask,
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/tasks", data);
    },
    onSuccess: () => {
      toast({
        title: "Task created successfully",
        description: "The new task has been added to the project.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setShowCreateTask(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Failed to create task",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setTaskTitle("");
    setTaskDescription("");
    setSelectedProject("");
    setAssignedTo("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taskTitle.trim() || !selectedProject) {
      toast({
        title: "Missing required fields",
        description: "Please fill in task title and select a project.",
        variant: "destructive",
      });
      return;
    }

    createTaskMutation.mutate({
      title: taskTitle.trim(),
      description: taskDescription.trim() || null,
      projectId: parseInt(selectedProject),
      assignedTo: assignedTo ? parseInt(assignedTo) : null,
      createdBy: user?.id,
      status: "todo",
    });
  };

  const filteredTasks = (tasks as any[])?.filter((task: any) => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (tasksLoading) {
    return (
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
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Tasks</h1>
          <p className="text-sm text-gray-500">Manage tasks across all projects</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          {user?.role === "admin" && (
            <Dialog open={showCreateTask} onOpenChange={setShowCreateTask}>
              <DialogTrigger asChild>
                <Button className="flex items-center">
                  <FaPlus className="mr-2" />
                  New Task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="taskTitle">Task Title *</Label>
                    <Input
                      id="taskTitle"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      placeholder="Enter task title"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="project">Project *</Label>
                    <Select value={selectedProject} onValueChange={setSelectedProject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a project..." />
                      </SelectTrigger>
                      <SelectContent>
                        {(projects as any[])?.map((project: any) => (
                          <SelectItem key={project.id} value={project.id.toString()}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="assignedTo">Assign To</Label>
                    <Select value={assignedTo} onValueChange={setAssignedTo}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team member..." />
                      </SelectTrigger>
                      <SelectContent>
                        {(users as any[])?.map((user: any) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="taskDescription">Description</Label>
                    <Textarea
                      id="taskDescription"
                      rows={3}
                      value={taskDescription}
                      onChange={(e) => setTaskDescription(e.target.value)}
                      placeholder="Describe the task requirements..."
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowCreateTask(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createTaskMutation.isPending}>
                      {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <TaskBoard tasks={filteredTasks || []} />
    </div>
  );
}