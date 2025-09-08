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
      description: "Redirecting to billing portal...",
    });
    // In production, this would redirect to Stripe/payment portal
    setTimeout(() => {
      toast({
        title: "Feature Preview",
        description: "This would integrate with Stripe for real billing",
      });
    }, 1500);
  };

  const handleBillingSettings = () => {
    setActiveTab("billing");
  };

  const handleAccountSettings = () => {
    setActiveTab("settings");
  };

  const handleSignOut = () => {
    toast({
      title: "Signing out...",
      description: "You will be redirected to the login page",
    });
    // In production, this would clear tokens and redirect
    setTimeout(() => {
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out",
      });
      onClose();
    }, 1500);
  };

  const handleSettingChange = (setting, value) => {
    setAccountSettings(prev => ({
      ...prev,
      [setting]: value
    }));
    toast({
      title: "Setting Updated",
      description: `${setting.replace(/([A-Z])/g, ' $1').toLowerCase()} has been ${value ? 'enabled' : 'disabled'}`,
    });
  };

  const handlePasswordChange = () => {
    toast({
      title: "Password Change",
      description: "Password reset link sent to your email",
    });
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      toast({
        title: "Account Deletion",
        description: "Account deletion request submitted. Check your email for confirmation.",
        variant: "destructive"
      });
    }
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
            Account Dashboard
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto max-h-[60vh] mt-4 pb-8">
            <TabsContent value="profile" className="space-y-6">
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
            </TabsContent>

            <TabsContent value="billing" className="space-y-6">
              {/* Current Plan */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard size={18} />
                    Current Plan & Billing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{billingInfo.plan}</div>
                      <div className="text-sm text-gray-500">Current Plan</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{billingInfo.amount}</div>
                      <div className="text-sm text-gray-500">Monthly Cost</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{billingInfo.nextBilling}</div>
                      <div className="text-sm text-gray-500">Next Billing</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button onClick={handleUpgradePlan}>
                      <Zap size={16} className="mr-2" />
                      Upgrade Plan
                    </Button>
                    <Button variant="outline">
                      <CreditCard size={16} className="mr-2" />
                      Payment Methods
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Billing History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Billing History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {billingInfo.billingHistory.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            item.status === 'Free Plan' ? 'bg-green-100' : 'bg-blue-100'
                          }`}>
                            <DollarSign size={16} className={item.status === 'Free Plan' ? 'text-green-600' : 'text-blue-600'} />
                          </div>
                          <div>
                            <p className="font-medium">{item.description}</p>
                            <p className="text-sm text-gray-500">{item.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{item.amount}</p>
                          <Badge variant={item.status === 'Free Plan' ? 'secondary' : 'default'}>
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              {/* Account Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings size={18} />
                    Account Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Email Notifications</Label>
                        <p className="text-sm text-gray-500">Receive emails about your account activity</p>
                      </div>
                      <Button
                        variant={accountSettings.emailNotifications ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSettingChange('emailNotifications', !accountSettings.emailNotifications)}
                      >
                        {accountSettings.emailNotifications ? <Check size={16} /> : <X size={16} />}
                      </Button>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Marketing Emails</Label>
                        <p className="text-sm text-gray-500">Receive updates about new features and offers</p>
                      </div>
                      <Button
                        variant={accountSettings.marketingEmails ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSettingChange('marketingEmails', !accountSettings.marketingEmails)}
                      >
                        {accountSettings.marketingEmails ? <Check size={16} /> : <X size={16} />}
                      </Button>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Data Collection</Label>
                        <p className="text-sm text-gray-500">Help improve our services with usage analytics</p>
                      </div>
                      <Button
                        variant={accountSettings.dataCollection ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSettingChange('dataCollection', !accountSettings.dataCollection)}
                      >
                        {accountSettings.dataCollection ? <Check size={16} /> : <X size={16} />}
                      </Button>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Two-Factor Authentication</Label>
                        <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                      </div>
                      <Button
                        variant={accountSettings.twoFactorAuth ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSettingChange('twoFactorAuth', !accountSettings.twoFactorAuth)}
                      >
                        {accountSettings.twoFactorAuth ? <Check size={16} /> : <AlertCircle size={16} />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" onClick={handlePasswordChange} className="w-full justify-start">
                    <Shield size={16} className="mr-2" />
                    Change Password
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <User size={16} className="mr-2" />
                    Download My Data
                  </Button>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-lg text-red-600">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteAccount}
                    className="w-full"
                  >
                    <AlertCircle size={16} className="mr-2" />
                    Delete Account
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    This action cannot be undone. All your data will be permanently deleted.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>

        {/* Action Buttons */}
        <div className="border-t pt-4 flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleBillingSettings}>
              <CreditCard size={16} className="mr-2" />
              Billing
            </Button>
            <Button variant="outline" onClick={handleAccountSettings}>
              <Settings size={16} className="mr-2" />
              Settings
            </Button>
          </div>
          <Button variant="destructive" onClick={handleSignOut}>
            <LogOut size={16} className="mr-2" />
            Sign Out
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal;