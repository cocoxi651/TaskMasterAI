import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { FaMagic } from "react-icons/fa";

interface TimeLogModalProps {
  open: boolean;
  onClose: () => void;
}

export default function TimeLogModal({ open, onClose }: TimeLogModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedTask, setSelectedTask] = useState("");
  const [hours, setHours] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState("");
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);

  const { data: tasks } = useQuery({
    queryKey: ["/api/tasks/user", user?.id],
    enabled: !!user?.id && open,
  });

  const logTimeMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/time-logs", data);
    },
    onSuccess: () => {
      toast({
        title: "Time logged successfully",
        description: "Your work hours have been recorded.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/time-logs"] });
      onClose();
      resetForm();
    },
    onError: () => {
      toast({
        title: "Failed to log time",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateSuggestionMutation = useMutation({
    mutationFn: async (taskTitle: string) => {
      const response = await apiRequest("POST", "/api/ai/suggest-log", { taskTitle });
      return response.json();
    },
    onSuccess: (data) => {
      setNotes(data.suggestion);
    },
    onError: () => {
      toast({
        title: "Failed to generate suggestion",
        description: "Please try again or write your own notes.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedTask("");
    setHours("");
    setDate(new Date().toISOString().split('T')[0]);
    setNotes("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTask || !hours || !date) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    logTimeMutation.mutate({
      taskId: parseInt(selectedTask),
      userId: user?.id,
      hours,
      date: new Date(date).toISOString(),
      notes: notes || null,
    });
  };

  const handleGenerateAISuggestion = () => {
    const task = tasks?.find((t: any) => t.id === parseInt(selectedTask));
    if (task) {
      generateSuggestionMutation.mutate(task.title);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Log Time</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="task">Select Task *</Label>
            <Select value={selectedTask} onValueChange={setSelectedTask}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a task..." />
              </SelectTrigger>
              <SelectContent>
                {tasks?.map((task: any) => (
                  <SelectItem key={task.id} value={task.id.toString()}>
                    {task.title} - Project #{task.projectId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="hours">Hours *</Label>
              <Input
                id="hours"
                type="number"
                step="0.5"
                min="0.5"
                max="24"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="2.5"
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="notes">Notes</Label>
            <div className="relative">
              <Textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe what you worked on..."
                className="resize-none"
              />
              {selectedTask && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-secondary hover:text-indigo-700"
                  onClick={handleGenerateAISuggestion}
                  disabled={generateSuggestionMutation.isPending}
                >
                  <FaMagic className="mr-1" />
                  {generateSuggestionMutation.isPending ? "Generating..." : "AI Suggest"}
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Click "AI Suggest" to generate notes based on the task title
            </p>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={logTimeMutation.isPending}>
              {logTimeMutation.isPending ? "Logging..." : "Log Time"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
