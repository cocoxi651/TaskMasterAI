import { useAuth } from "@/hooks/use-auth";
import AdminDashboard from "@/components/dashboard/admin-dashboard";
import UserDashboard from "@/components/dashboard/user-dashboard";
import Sidebar from "@/components/dashboard/sidebar";
import { useState } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState(
    user?.role === "admin" ? "dashboard" : "my-tasks"
  );

  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        activeView={activeView}
        onViewChange={setActiveView}
        isAdmin={isAdmin}
      />
      
      {isAdmin ? (
        <AdminDashboard />
      ) : (
        <UserDashboard />
      )}
    </div>
  );
}
