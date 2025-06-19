import { useAuth } from "@/hooks/use-auth";
import AdminDashboard from "@/components/dashboard/admin-dashboard";
import UserDashboard from "@/components/dashboard/user-dashboard";
import Sidebar from "@/components/dashboard/sidebar";
import ProjectsView from "@/components/views/projects-view";
import TasksView from "@/components/views/tasks-view";
import UsersView from "@/components/views/users-view";
import ReportsView from "@/components/views/reports-view";
import { useState } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState(
    user?.role === "admin" ? "dashboard" : "my-tasks"
  );

  const isAdmin = user?.role === "admin";

  const renderContent = () => {
    if (!isAdmin) {
      return <UserDashboard />;
    }

    switch (activeView) {
      case "projects":
        return (
          <div className="ml-64">
            <ProjectsView />
          </div>
        );
      case "tasks":
        return (
          <div className="ml-64">
            <TasksView />
          </div>
        );
      case "users":
        return (
          <div className="ml-64">
            <UsersView />
          </div>
        );
      case "reports":
        return (
          <div className="ml-64">
            <ReportsView />
          </div>
        );
      default:
        return <AdminDashboard activeView={activeView} onViewChange={setActiveView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        activeView={activeView}
        onViewChange={setActiveView}
        isAdmin={isAdmin}
      />
      
      {renderContent()}
    </div>
  );
}
