import React, { useState, useEffect } from "react";
import { 
  User, X, Edit2, Save, Calendar, Zap, TrendingUp, 
  Star, Shield, CreditCard, Settings, LogOut, DollarSign,
  Check, AlertCircle
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useToast } from "../hooks/use-toast";

const UserProfileModal = ({ isOpen, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [userInfo, setUserInfo] = useState({
    name: "John",
    email: "john@example.com",
    joinDate: "January 2025",
    plan: "Free Plan",
    avatar: ""
  });
  const [editedInfo, setEditedInfo] = useState({ ...userInfo });
  const [usageStats, setUsageStats] = useState({
    totalChats: 0,
    totalMessages: 0,
    tokensUsed: 0,
    tokensLimit: 10000,
    requestsToday: 0,
    requestsLimit: 100
  });
  const [billingInfo, setBillingInfo] = useState({
    plan: "Free Plan",
    nextBilling: "N/A",
    amount: "$0.00",
    paymentMethod: "None",
    billingHistory: [
      { date: "Dec 2024", amount: "$0.00", status: "Free Plan", description: "Free usage" },
    ]
  });
  const [accountSettings, setAccountSettings] = useState({
    emailNotifications: true,
    marketingEmails: false,
    dataCollection: true,
    twoFactorAuth: false
  });
  const { toast } = useToast();

  useEffect(() => {
    // Load user data and usage statistics
    loadUserData();
  }, []);

  const loadUserData = () => {
    // Simulated user data - in a real app, this would come from your backend
    const mockStats = {
      totalChats: Math.floor(Math.random() * 50) + 10,
      totalMessages: Math.floor(Math.random() * 500) + 100,
      tokensUsed: Math.floor(Math.random() * 8000) + 1000,
      tokensLimit: 10000,
      requestsToday: Math.floor(Math.random() * 30) + 5,
      requestsLimit: 100
    };
    setUsageStats(mockStats);
  };

  const handleSaveProfile = () => {
    setUserInfo({ ...editedInfo });
    setIsEditing(false);
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved",
    });
  };

  const handleCancelEdit = () => {
    setEditedInfo({ ...userInfo });
    setIsEditing(false);
  };

  const handleUpgradePlan = () => {
    toast({
      title: "Upgrade Plan",
      description: "Upgrade functionality would be available in the full version",
    });
  };

  const getUsageColor = (used, limit) => {
    const percentage = (used / limit) * 100;
    if (percentage < 50) return "bg-green-500";
    if (percentage < 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  const achievements = [
    { name: "First Chat", description: "Started your first conversation", earned: true },
    { name: "Chatty", description: "Sent 100 messages", earned: usageStats.totalMessages >= 100 },
    { name: "Explorer", description: "Created 10 chats", earned: usageStats.totalChats >= 10 },
    { name: "Power User", description: "Used 5000 tokens", earned: usageStats.tokensUsed >= 5000 },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User size={20} />
            User Profile
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[70vh]">
          <div className="space-y-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-6">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={userInfo.avatar} />
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {userInfo.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                      onClick={() => toast({ title: "Photo Upload", description: "Photo upload feature coming soon!" })}
                    >
                      <Edit2 size={12} />
                    </Button>
                  </div>
                  
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <Label>Name</Label>
                          <Input
                            value={editedInfo.name}
                            onChange={(e) => setEditedInfo({ ...editedInfo, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input
                            value={editedInfo.email}
                            onChange={(e) => setEditedInfo({ ...editedInfo, email: e.target.value })}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveProfile}>
                            <Save size={16} className="mr-1" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h2 className="text-2xl font-bold">{userInfo.name}</h2>
                          <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                            <Edit2 size={16} className="mr-1" />
                            Edit
                          </Button>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">{userInfo.email}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar size={16} />
                            Joined {userInfo.joinDate}
                          </div>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Star size={12} />
                            {userInfo.plan}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp size={18} />
                    Usage Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{usageStats.totalChats}</div>
                      <div className="text-sm text-gray-500">Total Chats</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{usageStats.totalMessages}</div>
                      <div className="text-sm text-gray-500">Messages Sent</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Tokens Used</span>
                        <span>{usageStats.tokensUsed.toLocaleString()} / {usageStats.tokensLimit.toLocaleString()}</span>
                      </div>
                      <Progress 
                        value={(usageStats.tokensUsed / usageStats.tokensLimit) * 100} 
                        className="h-2"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Requests Today</span>
                        <span>{usageStats.requestsToday} / {usageStats.requestsLimit}</span>
                      </div>
                      <Progress 
                        value={(usageStats.requestsToday / usageStats.requestsLimit) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield size={18} />
                    Plan Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Current Plan</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Free Plan</p>
                    </div>
                    <Badge variant="secondary">Free</Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Monthly Tokens</span>
                      <span>10,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Daily Requests</span>
                      <span>100</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Model Access</span>
                      <span>GPT-4o Mini</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={handleUpgradePlan}
                  >
                    <Zap size={16} className="mr-2" />
                    Upgrade Plan
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star size={18} />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        achievement.earned
                          ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20'
                          : 'border-gray-200 dark:border-gray-700 opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          achievement.earned ? 'bg-yellow-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`}>
                          <Star size={16} className="text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{achievement.name}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" className="flex items-center gap-2">
                    <CreditCard size={16} />
                    Billing
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Settings size={16} />
                    Account Settings
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50">
                    <LogOut size={16} />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal;