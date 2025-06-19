import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { FaMagic, FaTimes } from "react-icons/fa";

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateProjectModal({ open, onClose }: CreateProjectModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [generatedSubtasks, setGeneratedSubtasks] = useState<string[]>([]);

  const { data: users } = useQuery({
    queryKey: ["/api/users"],
    enabled: open,
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/projects", data);
    },
    onSuccess: async (response) => {
      const project = await response.json();
      
      // Add project members
      for (const memberId of selectedMembers) {
        await apiRequest("POST", "/api/project-members", {
          projectId: project.id,
          userId: memberId,
        });
      }

      // Create subtasks if any were generated
      for (const subtaskTitle of generatedSubtasks) {
        await apiRequest("POST", "/api/tasks", {
          title: subtaskTitle,
          projectId: project.id,
          createdBy: user?.id,
          status: "todo",
        });
      }

      toast({
        title: "Project created successfully",
        description: "Your new project has been set up with all team members and tasks.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      onClose();
      resetForm();
    },
    onError: () => {
      toast({
        title: "Failed to create project",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateSubtasksMutation = useMutation({
    mutationFn: async (data: { projectName: string; projectDescription: string }) => {
      const response = await apiRequest("POST", "/api/ai/generate-subtasks", data);
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedSubtasks(data.subtasks?.map((st: any) => st.title) || []);
    },
    onError: () => {
      toast({
        title: "Failed to generate subtasks",
        description: "Please try again or add tasks manually later.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setProjectName("");
    setProjectDescription("");
    setDueDate("");
    setSelectedMembers([]);
    setGeneratedSubtasks([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName.trim()) {
      toast({
        title: "Project name required",
        description: "Please enter a project name.",
        variant: "destructive",
      });
      return;
    }

    createProjectMutation.mutate({
      name: projectName.trim(),
      description: projectDescription.trim() || null,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      createdBy: user?.id,
    });
  };

  const handleGenerateSubtasks = () => {
    if (!projectName.trim()) {
      toast({
        title: "Project name required",
        description: "Please enter a project name first.",
        variant: "destructive",
      });
      return;
    }

    generateSubtasksMutation.mutate({
      projectName: projectName.trim(),
      projectDescription: projectDescription.trim(),
    });
  };

  const removeSubtask = (index: number) => {
    setGeneratedSubtasks(prev => prev.filter((_, i) => i !== index));
  };

  const toggleMember = (userId: number) => {
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="projectName">Project Name *</Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
                required
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="projectDescription">Description</Label>
            <Textarea
              id="projectDescription"
              rows={3}
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="Describe the project goals and requirements"
            />
          </div>
          
          <div>
            <Label>Assign Team Members</Label>
            <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3 mt-1">
              {users?.filter((u: any) => u.id !== user?.id).map((member: any) => (
                <label key={member.id} className="flex items-center">
                  <Checkbox
                    checked={selectedMembers.includes(member.id)}
                    onCheckedChange={() => toggleMember(member.id)}
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {member.name} ({member.email})
                  </span>
                </label>
              )) || (
                <p className="text-sm text-gray-500">No other team members available</p>
              )}
            </div>
          </div>
          
          <Card className="bg-purple-50 border-purple-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">AI-Generated Subtasks</CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerateSubtasks}
                  disabled={generateSubtasksMutation.isPending}
                  className="text-secondary hover:text-indigo-700"
                >
                  <FaMagic className="mr-1" />
                  {generateSubtasksMutation.isPending ? "Generating..." : "Generate Subtasks"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                AI will analyze your project description and suggest relevant tasks
              </p>
              
              {generatedSubtasks.length > 0 && (
                <div className="space-y-2">
                  {generatedSubtasks.map((subtask, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded border">
                      <span className="text-sm text-gray-900">{subtask}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSubtask(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTimes />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createProjectMutation.isPending}>
              {createProjectMutation.isPending ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
