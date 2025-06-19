import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import TaskDetailModal from "@/components/modals/task-detail-modal";
import type { Task } from "@shared/schema";

interface TaskBoardProps {
  tasks: Task[];
}

export default function TaskBoard({ tasks }: TaskBoardProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const todoTasks = tasks.filter(task => task.status === "todo");
  const qaTasks = tasks.filter(task => task.status === "qa");
  const doneTasks = tasks.filter(task => task.status === "done");

  const TaskCard = ({ task }: { task: Task }) => (
    <div 
      className={`rounded-lg p-4 border-l-4 hover:shadow-md transition-shadow cursor-pointer ${
        task.status === "todo" ? "bg-gray-50 border-gray-400" :
        task.status === "qa" ? "bg-yellow-50 border-yellow-400" :
        "bg-green-50 border-green-400 opacity-75"
      }`}
      onClick={() => setSelectedTask(task)}
    >
      <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
      <p className="text-sm text-gray-600 mb-3">{task.description || "No description"}</p>
      <div className="flex items-center justify-between">
        <Badge variant="secondary">Project #{task.projectId}</Badge>
        <span className="text-xs text-gray-500">
          {new Date(task.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );

  const Column = ({ 
    title, 
    tasks, 
    count, 
    color 
  }: { 
    title: string; 
    tasks: Task[]; 
    count: number;
    color: string;
  }) => (
    <Card>
      <CardHeader className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <div className={`w-3 h-3 ${color} rounded-full mr-2`}></div>
            {title}
          </h3>
          <Badge variant="outline" className={
            title === "To Do" ? "bg-gray-100 text-gray-800" :
            title === "In QA" ? "bg-yellow-100 text-yellow-800" :
            "bg-green-100 text-green-800"
          }>
            {count}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {tasks.length > 0 ? (
          tasks.map(task => <TaskCard key={task.id} task={task} />)
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No tasks in {title.toLowerCase()}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Column 
          title="To Do" 
          tasks={todoTasks} 
          count={todoTasks.length}
          color="bg-gray-400"
        />
        <Column 
          title="In QA" 
          tasks={qaTasks} 
          count={qaTasks.length}
          color="bg-yellow-400"
        />
        <Column 
          title="Done" 
          tasks={doneTasks} 
          count={doneTasks.length}
          color="bg-green-400"
        />
      </div>

      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask}
          open={!!selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </>
  );
}
