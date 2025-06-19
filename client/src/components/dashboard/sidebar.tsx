import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FaTasks, FaChartLine, FaFolder, FaUsers, FaChartBar, FaClock, FaSignOutAlt, FaUser } from "react-icons/fa";

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isAdmin: boolean;
}

export default function Sidebar({ activeView, onViewChange, isAdmin }: SidebarProps) {
  const { user, logout } = useAuth();

  const adminNavItems = [
    { id: "dashboard", label: "Dashboard", icon: FaChartLine },
    { id: "projects", label: "Projects", icon: FaFolder },
    { id: "tasks", label: "Tasks", icon: FaTasks },
    { id: "users", label: "Team", icon: FaUsers },
    { id: "reports", label: "Reports", icon: FaChartBar },
  ];

  const userNavItems = [
    { id: "my-tasks", label: "My Tasks", icon: FaTasks },
    { id: "time-logs", label: "Time Logs", icon: FaClock },
    { id: "projects", label: "Projects", icon: FaFolder },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-200">
      <div className="flex items-center h-16 px-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="h-8 w-8 flex items-center justify-center rounded bg-primary text-white">
            <FaTasks className="text-sm" />
          </div>
          <span className="ml-3 text-xl font-semibold text-gray-900">TaskFlow</span>
        </div>
      </div>
      
      <nav className="mt-6 px-3">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full text-left group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="mr-3 text-sm" />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
        <div className="flex items-center mb-3">
          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
            <FaUser className="text-sm text-gray-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">
              {user?.role === "admin" ? "Administrator" : "Team Member"}
            </p>
          </div>
        </div>
        <Separator className="mb-3" />
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="w-full justify-start text-gray-500 hover:text-gray-700"
        >
          <FaSignOutAlt className="mr-2 text-sm" />
          Sign out
        </Button>
      </div>
    </div>
  );
}
