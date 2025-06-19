import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { FaPlus, FaUser, FaCrown, FaSearch } from "react-icons/fa";

export default function UsersView() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("user");

  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/users"],
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/users", data);
    },
    onSuccess: () => {
      toast({
        title: "User created successfully",
        description: "The new team member has been added.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setShowCreateUser(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Failed to create user",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setUserName("");
    setUserEmail("");
    setUserRole("user");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userName.trim() || !userEmail.trim()) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createUserMutation.mutate({
      name: userName.trim(),
      email: userEmail.trim(),
      role: userRole,
    });
  };

  const filteredUsers = (users as any[])?.filter((u: any) => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
          <h1 className="text-2xl font-semibold text-gray-900">Team Members</h1>
          <p className="text-sm text-gray-500">Manage your team and user permissions</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          {user?.role === "admin" && (
            <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
              <DialogTrigger asChild>
                <Button className="flex items-center">
                  <FaPlus className="mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add New Team Member</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="userName">Full Name *</Label>
                    <Input
                      id="userName"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="userEmail">Email Address *</Label>
                    <Input
                      id="userEmail"
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="userRole">Role</Label>
                    <Select value={userRole} onValueChange={setUserRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Team Member</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowCreateUser(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createUserMutation.isPending}>
                      {createUserMutation.isPending ? "Adding..." : "Add User"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers?.map((member: any) => (
          <Card key={member.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>
                    {member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{member.name}</h3>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
                {member.role === "admin" ? (
                  <Badge className="bg-purple-100 text-purple-800">
                    <FaCrown className="mr-1" />
                    Admin
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <FaUser className="mr-1" />
                    User
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-500">
                <div>Member since: {new Date(member.createdAt).toLocaleDateString()}</div>
                <div>Status: Active</div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <Button variant="outline" size="sm">
                  View Profile
                </Button>
                {user?.role === "admin" && member.id !== user.id && (
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                    Remove
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )) || (
          <div className="col-span-full text-center py-12">
            <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FaUser className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No team members</h3>
            <p className="text-gray-500 mb-4">
              Add team members to start collaborating
            </p>
            {user?.role === "admin" && (
              <Button onClick={() => setShowCreateUser(true)}>
                Add Team Member
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}