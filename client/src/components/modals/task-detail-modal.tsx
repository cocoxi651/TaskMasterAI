import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import TimeLogModal from "./time-log-modal";
import type { Task } from "@shared/schema";
import { FaClock, FaComment } from "react-icons/fa";

interface TaskDetailModalProps {
  task: Task;
  open: boolean;
  onClose: () => void;
}

export default function TaskDetailModal({ task, open, onClose }: TaskDetailModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showTimeLog, setShowTimeLog] = useState(false);

  const { data: subtasks } = useQuery({
    queryKey: ["/api/subtasks/task", task.id],
    enabled: open,
  });

  const { data: timeLogs } = useQuery({
    queryKey: ["/api/time-logs/task", task.id],
    enabled: open,
  });

  const { data: project } = useQuery({
    queryKey: ["/api/projects", task.projectId],
    enabled: open,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      return apiRequest("PATCH", `/api/tasks/${task.id}/status`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Task status updated",
        description: "The task status has been changed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      onClose();
    },
    onError: () => {
      toast({
        title: "Failed to update status",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateSubtaskMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      return apiRequest("PATCH", `/api/subtasks/${id}/status`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subtasks"] });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo": return "bg-gray-100 text-gray-800";
      case "qa": return "bg-yellow-100 text-yellow-800";
      case "done": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "todo": return "To Do";
      case "qa": return "In QA";
      case "done": return "Done";
      default: return status;
    }
  };

  const handleStatusUpdate = (status: string) => {
    updateStatusMutation.mutate(status);
  };

  const handleSubtaskToggle = (subtaskId: number, completed: boolean) => {
    updateSubtaskMutation.mutate({ id: subtaskId, completed });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DialogTitle className="mr-3">{task.title}</DialogTitle>
                <Badge className={getStatusColor(task.status)}>
                  {getStatusLabel(task.status)}
                </Badge>
              </div>
            </div>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Task Details */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-sm text-gray-600">
                  {task.description || "No description provided for this task."}
                </p>
              </div>
              
              {subtasks && subtasks.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Subtasks</h4>
                  <div className="space-y-2">
                    {subtasks.map((subtask: any) => (
                      <label key={subtask.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Checkbox
                          checked={subtask.completed}
                          onCheckedChange={(checked) => 
                            handleSubtaskToggle(subtask.id, checked as boolean)
                          }
                        />
                        <span 
                          className={`ml-3 text-sm ${
                            subtask.completed ? "line-through text-gray-500" : "text-gray-700"
                          }`}
                        >
                          {subtask.title}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              
              {timeLogs && timeLogs.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Time Logs</h4>
                  <div className="space-y-2">
                    {timeLogs.map((log: any) => (
                      <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{log.hours} hours</p>
                          <p className="text-xs text-gray-500">
                            {new Date(log.date).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 flex-1 ml-4">
                          {log.notes || "No notes provided"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Task Actions */}
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Update Status</h4>
                <div className="space-y-2">
                  <Button
                    variant={task.status === "todo" ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => handleStatusUpdate("todo")}
                    disabled={updateStatusMutation.isPending}
                  >
                    <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
                    To Do
                  </Button>
                  <Button
                    variant={task.status === "qa" ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => handleStatusUpdate("qa")}
                    disabled={updateStatusMutation.isPending}
                  >
                    <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></div>
                    In QA
                  </Button>
                  <Button
                    variant={task.status === "done" ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => handleStatusUpdate("done")}
                    disabled={updateStatusMutation.isPending}
                  >
                    <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                    Done
                  </Button>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Project Info</h4>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-gray-900">
                      Project #{task.projectId}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {project?.dueDate ? `Due: ${new Date(project.dueDate).toLocaleDateString()}` : "No due date"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Created: {new Date(task.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="flex flex-col space-y-2">
                <Button
                  onClick={() => setShowTimeLog(true)}
                  className="w-full bg-secondary hover:bg-indigo-700"
                >
                  <FaClock className="mr-2" />
                  Log Time
                </Button>
                <Button variant="outline" className="w-full">
                  <FaComment className="mr-2" />
                  Add Comment
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <TimeLogModal 
        open={showTimeLog} 
        onClose={() => setShowTimeLog(false)} 
      />
    </>
  );
}
