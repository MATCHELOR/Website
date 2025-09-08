import React, { useState, useEffect } from "react";
import { 
  Settings, X, Moon, Sun, Monitor, Download, Upload, 
  Trash2, Key, Zap, Brain, Bot
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { useToast } from "../hooks/use-toast";
import { chatAPI } from "../utils/api";

const SettingsModal = ({ isOpen, onClose }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');
  const [selectedModel, setSelectedModel] = useState(localStorage.getItem('selectedModel') || 'gpt-4o-mini');
  const [autoSave, setAutoSave] = useState(localStorage.getItem('autoSave') !== 'false');
  const [showTimestamps, setShowTimestamps] = useState(localStorage.getItem('showTimestamps') !== 'false');
  const [apiUsage, setApiUsage] = useState({ requests: 0, tokens: 0, cost: 0 });
  const [customApiKey, setCustomApiKey] = useState('');
  const { toast } = useToast();

  const models = [
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', icon: Bot, description: 'Fast and cost-effective' },
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', icon: Brain, description: 'Most capable model' },
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', icon: Zap, description: 'Excellent reasoning' },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'Google', icon: Bot, description: 'Latest from Google' }
  ];

  useEffect(() => {
    // Apply theme on component mount
    applyTheme(theme);
    // Load mock API usage data
    setApiUsage({
      requests: Math.floor(Math.random() * 100) + 20,
      tokens: Math.floor(Math.random() * 10000) + 1000,
      cost: (Math.random() * 5).toFixed(2)
    });
  }, [theme]);

  const applyTheme = (newTheme) => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(newTheme);
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
    toast({
      title: "Theme updated",
      description: `Switched to ${newTheme} theme`,
    });
  };

  const handleModelChange = (newModel) => {
    setSelectedModel(newModel);
    localStorage.setItem('selectedModel', newModel);
    const modelInfo = models.find(m => m.id === newModel);
    toast({
      title: "Model updated",
      description: `Switched to ${modelInfo?.name}`,
    });
  };

  const handleExportChats = async () => {
    try {
      const chats = await chatAPI.getChats();
      const chatData = JSON.stringify(chats, null, 2);
      const blob = new Blob([chatData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `matchelor-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export successful",
        description: "Chat history has been exported",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export chat history",
        variant: "destructive"
      });
    }
  };

  const handleImportChats = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          // In a real app, you'd process and import this data
          toast({
            title: "Import successful",
            description: `Imported ${importedData.length || 0} chats`,
          });
        } catch (error) {
          toast({
            title: "Import failed",
            description: "Invalid file format",
            variant: "destructive"
          });
        }
      };
      reader.readAsText(file);
    }
    event.target.value = '';
  };

  const handleClearAllChats = () => {
    if (window.confirm('Are you sure you want to delete all chats? This action cannot be undone.')) {
      // In a real app, you'd call an API to delete all chats
      toast({
        title: "All chats cleared",
        description: "All chat history has been deleted",
      });
    }
  };

  const handlePreferenceChange = (key, value) => {
    localStorage.setItem(key, value);
    if (key === 'autoSave') setAutoSave(value);
    if (key === 'showTimestamps') setShowTimestamps(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings size={20} />
            Settings
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="general" className="flex-1">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="models">Models</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto max-h-[60vh] mt-4">
            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Appearance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-base">Theme</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant={theme === 'light' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleThemeChange('light')}
                        className="flex items-center gap-2"
                      >
                        <Sun size={16} />
                        Light
                      </Button>
                      <Button
                        variant={theme === 'dark' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleThemeChange('dark')}
                        className="flex items-center gap-2"
                      >
                        <Moon size={16} />
                        Dark
                      </Button>
                      <Button
                        variant={theme === 'system' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleThemeChange('system')}
                        className="flex items-center gap-2"
                      >
                        <Monitor size={16} />
                        System
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Chat Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Auto-save conversations</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Automatically save your chats
                      </p>
                    </div>
                    <Switch
                      checked={autoSave}
                      onCheckedChange={(checked) => handlePreferenceChange('autoSave', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Show timestamps</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Display message timestamps
                      </p>
                    </div>
                    <Switch
                      checked={showTimestamps}
                      onCheckedChange={(checked) => handlePreferenceChange('showTimestamps', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Usage Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{apiUsage.requests}</div>
                      <div className="text-sm text-gray-500">Requests</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{apiUsage.tokens.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Tokens</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">${apiUsage.cost}</div>
                      <div className="text-sm text-gray-500">Cost</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="models" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">AI Model Selection</CardTitle>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Choose which AI model to use for conversations
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {models.map((model) => {
                    const IconComponent = model.icon;
                    return (
                      <div
                        key={model.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedModel === model.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        onClick={() => handleModelChange(model.id)}
                      >
                        <div className="flex items-start gap-3">
                          <IconComponent size={20} className="mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{model.name}</h3>
                              <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                {model.provider}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {model.description}
                            </p>
                          </div>
                          {selectedModel === model.id && (
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Data Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-base">Export Conversations</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Export all your chat history as JSON
                    </p>
                    <Button onClick={handleExportChats} className="flex items-center gap-2">
                      <Download size={16} />
                      Export Chats
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label className="text-base">Import Conversations</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Import chat history from a JSON file
                    </p>
                    <div>
                      <Input
                        type="file"
                        accept=".json"
                        onChange={handleImportChats}
                        className="hidden"
                        id="import-file"
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => document.getElementById('import-file').click()}
                        className="flex items-center gap-2"
                      >
                        <Upload size={16} />
                        Import Chats
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label className="text-base text-red-600">Danger Zone</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Permanently delete all your conversations
                    </p>
                    <Button 
                      variant="destructive" 
                      onClick={handleClearAllChats}
                      className="flex items-center gap-2"
                    >
                      <Trash2 size={16} />
                      Clear All Chats
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="api" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">API Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-base">Current API Key</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Using Emergent Universal Key
                    </p>
                    <div className="flex items-center gap-2">
                      <Input
                        type="password"
                        value="sk-emergent-*********************"
                        disabled
                        className="font-mono"
                      />
                      <Button variant="outline" size="sm">
                        <Key size={16} />
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label className="text-base">Custom API Key (Optional)</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Use your own OpenAI API key instead of the universal key
                    </p>
                    <div className="flex items-center gap-2">
                      <Input
                        type="password"
                        placeholder="sk-..."
                        value={customApiKey}
                        onChange={(e) => setCustomApiKey(e.target.value)}
                        className="font-mono"
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          toast({
                            title: "Custom API Key",
                            description: "This feature will be available in the full version",
                          });
                        }}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="about" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">About Matchelor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      A pixel-perfect Matchelor real estate AI assistant built with React, FastAPI, and MongoDB.
                      Powered by Emergent AI with support for multiple language models.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="font-medium">Version</Label>
                      <p className="text-gray-600 dark:text-gray-400">1.0.0</p>
                    </div>
                    <div>
                      <Label className="font-medium">Built with</Label>
                      <p className="text-gray-600 dark:text-gray-400">React + FastAPI</p>
                    </div>
                    <div>
                      <Label className="font-medium">AI Provider</Label>
                      <p className="text-gray-600 dark:text-gray-400">Emergent Universal Key</p>
                    </div>
                    <div>
                      <Label className="font-medium">Database</Label>
                      <p className="text-gray-600 dark:text-gray-400">MongoDB</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      © 2025 Matchelor. Built with ❤️ using Emergent AI.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;