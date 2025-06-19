import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertProjectSchema, insertTaskSchema, 
  insertSubtaskSchema, insertTimeLogSchema, insertProjectMemberSchema 
} from "@shared/schema";
import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Users
  app.get("/api/users", async (req, res) => {
    try {
      // Get all users from storage
      const users = Array.from((storage as any).users.values());
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.get("/api/users/email/:email", async (req, res) => {
    try {
      const user = await storage.getUserByEmail(req.params.email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Projects
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(parseInt(req.params.id));
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.get("/api/projects/user/:userId", async (req, res) => {
    try {
      const projects = await storage.getProjectsByUser(parseInt(req.params.userId));
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user projects" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ message: "Invalid project data" });
    }
  });

  // Tasks
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get("/api/tasks/project/:projectId", async (req, res) => {
    try {
      const tasks = await storage.getTasksByProject(parseInt(req.params.projectId));
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project tasks" });
    }
  });

  app.get("/api/tasks/user/:userId", async (req, res) => {
    try {
      const tasks = await storage.getTasksByUser(parseInt(req.params.userId));
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user tasks" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ message: "Invalid task data" });
    }
  });

  app.patch("/api/tasks/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const task = await storage.updateTaskStatus(parseInt(req.params.id), status);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to update task status" });
    }
  });

  // Subtasks
  app.get("/api/subtasks/task/:taskId", async (req, res) => {
    try {
      const subtasks = await storage.getSubtasksByTask(parseInt(req.params.taskId));
      res.json(subtasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subtasks" });
    }
  });

  app.post("/api/subtasks", async (req, res) => {
    try {
      const subtaskData = insertSubtaskSchema.parse(req.body);
      const subtask = await storage.createSubtask(subtaskData);
      res.status(201).json(subtask);
    } catch (error) {
      res.status(400).json({ message: "Invalid subtask data" });
    }
  });

  app.patch("/api/subtasks/:id/status", async (req, res) => {
    try {
      const { completed } = req.body;
      const subtask = await storage.updateSubtaskStatus(parseInt(req.params.id), completed);
      if (!subtask) {
        return res.status(404).json({ message: "Subtask not found" });
      }
      res.json(subtask);
    } catch (error) {
      res.status(500).json({ message: "Failed to update subtask status" });
    }
  });

  // Time Logs
  app.get("/api/time-logs/task/:taskId", async (req, res) => {
    try {
      const timeLogs = await storage.getTimeLogsByTask(parseInt(req.params.taskId));
      res.json(timeLogs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch time logs" });
    }
  });

  app.get("/api/time-logs/user/:userId", async (req, res) => {
    try {
      const timeLogs = await storage.getTimeLogsByUser(parseInt(req.params.userId));
      res.json(timeLogs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user time logs" });
    }
  });

  app.post("/api/time-logs", async (req, res) => {
    try {
      const timeLogData = insertTimeLogSchema.parse(req.body);
      const timeLog = await storage.createTimeLog(timeLogData);
      res.status(201).json(timeLog);
    } catch (error) {
      res.status(400).json({ message: "Invalid time log data" });
    }
  });

  // Project Members
  app.get("/api/project-members/:projectId", async (req, res) => {
    try {
      const members = await storage.getProjectMembers(parseInt(req.params.projectId));
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project members" });
    }
  });

  app.post("/api/project-members", async (req, res) => {
    try {
      const memberData = insertProjectMemberSchema.parse(req.body);
      const member = await storage.addProjectMember(memberData);
      res.status(201).json(member);
    } catch (error) {
      res.status(400).json({ message: "Invalid project member data" });
    }
  });

  // Analytics
  app.get("/api/analytics/project/:projectId/hours", async (req, res) => {
    try {
      const hours = await storage.getHoursByProject(parseInt(req.params.projectId));
      res.json({ hours });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project hours" });
    }
  });

  app.get("/api/analytics/user/:userId/hours", async (req, res) => {
    try {
      const hours = await storage.getHoursByUser(parseInt(req.params.userId));
      res.json({ hours });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user hours" });
    }
  });

  app.get("/api/analytics/stats", async (req, res) => {
    try {
      const stats = await storage.getProjectStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // AI Features
  app.post("/api/ai/suggest-log", async (req, res) => {
    try {
      const { taskTitle } = req.body;
      
      if (!taskTitle) {
        return res.status(400).json({ message: "Task title is required" });
      }
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that generates professional work log entries based on task titles. Generate a concise, professional log entry that describes typical work done for the given task. Keep it under 100 words and focus on concrete actions."
          },
          {
            role: "user",
            content: `Generate a work log entry for this task: "${taskTitle}"`
          }
        ],
        max_tokens: 150,
      });

      const suggestion = response.choices[0].message.content;
      res.json({ suggestion });
    } catch (error: any) {
      console.error("AI suggestion error:", error);
      res.status(500).json({ message: "Failed to generate AI suggestion: " + (error.message || "Unknown error") });
    }
  });

  app.post("/api/ai/generate-subtasks", async (req, res) => {
    try {
      const { projectName, projectDescription } = req.body;
      
      if (!projectName) {
        return res.status(400).json({ message: "Project name is required" });
      }
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a project management assistant. Generate a list of 3-6 realistic subtasks for a software project based on the project name and description. Return the response as a JSON object with a 'subtasks' array containing objects with 'title' properties. Keep titles concise and actionable."
          },
          {
            role: "user",
            content: `Project: ${projectName}\n\nDescription: ${projectDescription || 'No description provided'}\n\nGenerate subtasks for this project.`
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || '{"subtasks": []}');
      res.json(result);
    } catch (error: any) {
      console.error("AI subtask generation error:", error);
      res.status(500).json({ message: "Failed to generate subtasks: " + (error.message || "Unknown error") });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
