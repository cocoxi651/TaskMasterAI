import { 
  users, projects, tasks, subtasks, timeLogs, projectMembers,
  type User, type InsertUser,
  type Project, type InsertProject,
  type Task, type InsertTask,
  type Subtask, type InsertSubtask,
  type TimeLog, type InsertTimeLog,
  type ProjectMember, type InsertProjectMember
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Projects
  getProject(id: number): Promise<Project | undefined>;
  getProjects(): Promise<Project[]>;
  getProjectsByUser(userId: number): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  
  // Tasks
  getTask(id: number): Promise<Task | undefined>;
  getTasks(): Promise<Task[]>;
  getTasksByProject(projectId: number): Promise<Task[]>;
  getTasksByUser(userId: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTaskStatus(id: number, status: string): Promise<Task | undefined>;
  
  // Subtasks
  getSubtasksByTask(taskId: number): Promise<Subtask[]>;
  createSubtask(subtask: InsertSubtask): Promise<Subtask>;
  updateSubtaskStatus(id: number, completed: boolean): Promise<Subtask | undefined>;
  
  // Time Logs
  getTimeLogsByTask(taskId: number): Promise<TimeLog[]>;
  getTimeLogsByUser(userId: number): Promise<TimeLog[]>;
  createTimeLog(timeLog: InsertTimeLog): Promise<TimeLog>;
  
  // Project Members
  getProjectMembers(projectId: number): Promise<User[]>;
  addProjectMember(projectMember: InsertProjectMember): Promise<ProjectMember>;
  
  // Analytics
  getHoursByProject(projectId: number): Promise<number>;
  getHoursByUser(userId: number): Promise<number>;
  getProjectStats(): Promise<{
    activeProjects: number;
    completedTasks: number;
    totalHours: number;
    teamMembers: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private tasks: Map<number, Task>;
  private subtasks: Map<number, Subtask>;
  private timeLogs: Map<number, TimeLog>;
  private projectMembers: Map<number, ProjectMember>;
  private currentUserId: number;
  private currentProjectId: number;
  private currentTaskId: number;
  private currentSubtaskId: number;
  private currentTimeLogId: number;
  private currentProjectMemberId: number;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.tasks = new Map();
    this.subtasks = new Map();
    this.timeLogs = new Map();
    this.projectMembers = new Map();
    this.currentUserId = 1;
    this.currentProjectId = 1;
    this.currentTaskId = 1;
    this.currentSubtaskId = 1;
    this.currentTimeLogId = 1;
    this.currentProjectMemberId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProjectsByUser(userId: number): Promise<Project[]> {
    const memberProjects = Array.from(this.projectMembers.values())
      .filter(pm => pm.userId === userId)
      .map(pm => pm.projectId);
    
    return Array.from(this.projects.values())
      .filter(p => p.createdBy === userId || memberProjects.includes(p.id));
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.currentProjectId++;
    const project: Project = { 
      ...insertProject, 
      id, 
      createdAt: new Date() 
    };
    this.projects.set(id, project);
    return project;
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTasksByProject(projectId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.projectId === projectId);
  }

  async getTasksByUser(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.assignedTo === userId);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const task: Task = { 
      ...insertTask, 
      id, 
      createdAt: new Date() 
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTaskStatus(id: number, status: string): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (task) {
      const updatedTask = { ...task, status };
      this.tasks.set(id, updatedTask);
      return updatedTask;
    }
    return undefined;
  }

  async getSubtasksByTask(taskId: number): Promise<Subtask[]> {
    return Array.from(this.subtasks.values()).filter(subtask => subtask.taskId === taskId);
  }

  async createSubtask(insertSubtask: InsertSubtask): Promise<Subtask> {
    const id = this.currentSubtaskId++;
    const subtask: Subtask = { 
      ...insertSubtask, 
      id, 
      createdAt: new Date() 
    };
    this.subtasks.set(id, subtask);
    return subtask;
  }

  async updateSubtaskStatus(id: number, completed: boolean): Promise<Subtask | undefined> {
    const subtask = this.subtasks.get(id);
    if (subtask) {
      const updatedSubtask = { ...subtask, completed };
      this.subtasks.set(id, updatedSubtask);
      return updatedSubtask;
    }
    return undefined;
  }

  async getTimeLogsByTask(taskId: number): Promise<TimeLog[]> {
    return Array.from(this.timeLogs.values()).filter(log => log.taskId === taskId);
  }

  async getTimeLogsByUser(userId: number): Promise<TimeLog[]> {
    return Array.from(this.timeLogs.values()).filter(log => log.userId === userId);
  }

  async createTimeLog(insertTimeLog: InsertTimeLog): Promise<TimeLog> {
    const id = this.currentTimeLogId++;
    const timeLog: TimeLog = { 
      ...insertTimeLog, 
      id, 
      createdAt: new Date() 
    };
    this.timeLogs.set(id, timeLog);
    return timeLog;
  }

  async getProjectMembers(projectId: number): Promise<User[]> {
    const memberIds = Array.from(this.projectMembers.values())
      .filter(pm => pm.projectId === projectId)
      .map(pm => pm.userId);
    
    return Array.from(this.users.values()).filter(user => memberIds.includes(user.id));
  }

  async addProjectMember(insertProjectMember: InsertProjectMember): Promise<ProjectMember> {
    const id = this.currentProjectMemberId++;
    const projectMember: ProjectMember = { 
      ...insertProjectMember, 
      id, 
      createdAt: new Date() 
    };
    this.projectMembers.set(id, projectMember);
    return projectMember;
  }

  async getHoursByProject(projectId: number): Promise<number> {
    const projectTasks = Array.from(this.tasks.values()).filter(task => task.projectId === projectId);
    const taskIds = projectTasks.map(task => task.id);
    const logs = Array.from(this.timeLogs.values()).filter(log => taskIds.includes(log.taskId));
    return logs.reduce((total, log) => total + parseFloat(log.hours), 0);
  }

  async getHoursByUser(userId: number): Promise<number> {
    const logs = Array.from(this.timeLogs.values()).filter(log => log.userId === userId);
    return logs.reduce((total, log) => total + parseFloat(log.hours), 0);
  }

  async getProjectStats(): Promise<{
    activeProjects: number;
    completedTasks: number;
    totalHours: number;
    teamMembers: number;
  }> {
    const projects = Array.from(this.projects.values());
    const tasks = Array.from(this.tasks.values());
    const timeLogs = Array.from(this.timeLogs.values());
    const users = Array.from(this.users.values());

    return {
      activeProjects: projects.length,
      completedTasks: tasks.filter(task => task.status === 'done').length,
      totalHours: timeLogs.reduce((total, log) => total + parseFloat(log.hours), 0),
      teamMembers: users.length,
    };
  }
}

export const storage = new MemStorage();
