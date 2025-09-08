import React, { useState, useRef, useEffect } from "react";
import { Send, Plus, User, Settings, Menu, MessageSquare, Edit3, Trash2, Loader2, Paperclip, Image, MoreHorizontal, AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Card, CardContent } from "./ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "./ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { chatAPI } from "../utils/api";
import { useToast } from "../hooks/use-toast";
import SettingsModal from "./SettingsModal";
import UserProfileModal from "./UserProfileModal";

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const { toast } = useToast();

  const suggestionCards = [
    {
      title: "Help me find properties in a specific neighborhood with good schools",
      icon: "🏠"
    },
    {
      title: "What questions should I ask during a property viewing?",
      icon: "❓"
    },
    {
      title: "Calculate mortgage payments and affordability for my budget",
      icon: "💰"
    },
    {
      title: "Explain the home buying process step by step",
      icon: "📋"
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history on component mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      setIsLoadingChats(true);
      const chats = await chatAPI.getChats();
      setChatHistory(chats);
      
      // If we have chats but no current chat selected, select the first one
      if (chats.length > 0 && !currentChatId) {
        await selectChat(chats[0].id);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive"
      });
    } finally {
      setIsLoadingChats(false);
    }
  };

  const handleSendMessage = async (messageText = null) => {
    const textToSend = messageText || inputValue;
    if (!textToSend.trim() || isTyping) return;

    // If no current chat, create one first
    if (!currentChatId) {
      await startNewChat();
    }

    if (!messageText) setInputValue("");
    setIsTyping(true);

    try {
      const response = await chatAPI.sendMessage(currentChatId, textToSend);
      
      // Add both user message and AI response to messages
      setMessages(prev => [
        ...prev,
        {
          id: response.userMessage.id,
          text: response.userMessage.text,
          sender: response.userMessage.sender,
          timestamp: response.userMessage.timestamp
        },
        {
          id: response.aiResponse.id,
          text: response.aiResponse.text,
          sender: response.aiResponse.sender,
          timestamp: response.aiResponse.timestamp
        }
      ]);

      // Refresh chat history to update message counts and titles
      await loadChatHistory();

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error", 
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
      
      // Put the message back in the input field if it was typed
      if (!messageText) setInputValue(textToSend);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion.title);
  };

  const startNewChat = async () => {
    try {
      setIsLoading(true);
      const newChat = await chatAPI.createChat();
      
      // Update chat history
      setChatHistory(prev => [newChat, ...prev]);
      
      // Switch to new chat
      setCurrentChatId(newChat.id);
      setMessages([]);
      setSidebarOpen(false);
      
      toast({
        title: "New chat started",
        description: "Ready for your questions!",
      });
      
      return newChat.id;
    } catch (error) {
      console.error('Error creating new chat:', error);
      toast({
        title: "Error",
        description: "Failed to create new chat",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectChat = async (chatId) => {
    try {
      setIsLoading(true);
      setCurrentChatId(chatId);
      
      // Load messages for the selected chat
      const messages = await chatAPI.getMessages(chatId);
      setMessages(messages);
      setSidebarOpen(false);
      
    } catch (error) {
      console.error('Error loading chat messages:', error);
      toast({
        title: "Error",
        description: "Failed to load chat messages",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteChat = async (chatId, e) => {
    e.stopPropagation();
    
    try {
      await chatAPI.deleteChat(chatId);
      setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
      
      if (currentChatId === chatId) {
        setCurrentChatId(null);
        setMessages([]);
      }
      
      toast({
        title: "Chat deleted",
        description: "Chat has been successfully deleted",
      });
      
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast({
        title: "Error",
        description: "Failed to delete chat",
        variant: "destructive"
      });
    }
  };

  const Sidebar = () => (
    <div className="w-64 bg-white border-r border-gray-100 flex flex-col h-full">
      {/* Sidebar Header */}
      <div className="p-3 border-b border-gray-100">
        <Button 
          onClick={startNewChat} 
          disabled={isLoading}
          variant="ghost"
          className="w-full justify-start text-sm font-normal px-3 py-2 h-auto"
        >
          <Plus size={16} className="mr-2" />
          New chat
        </Button>
      </div>
      
      {/* Chat History */}
      <ScrollArea className="flex-1">
        {isLoadingChats ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin" size={20} />
          </div>
        ) : (
          <div className="p-2">
            {chatHistory.map((chat) => (
              <div
                key={chat.id}
                onClick={() => selectChat(chat.id)}
                className={`group px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm mb-1 ${
                  currentChatId === chat.id
                    ? "bg-gray-100"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 truncate font-medium">
                      {chat.title}
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={(e) => deleteChat(chat.id, e)}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
      
      {/* Sidebar Footer */}
      <div className="p-3 border-t border-gray-100">
        <div 
          className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
          onClick={() => setProfileOpen(true)}
        >
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-orange-500 text-white text-xs">
              J
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-gray-900">John</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex bg-white">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-100 px-4 py-3 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
            </Sheet>
            <h1 className="text-lg font-semibold text-gray-900">ChatGPT</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings size={16} />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden">
          {messages.length === 0 ? (
            /* Welcome Screen */
            <div className="h-full flex flex-col items-center justify-center px-4">
              <div className="max-w-3xl w-full">
                {/* Welcome Message */}
                <div className="text-center mb-12">
                  <h1 className="text-4xl font-semibold text-gray-900 mb-2">
                    Hi there, <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">John</span>
                  </h1>
                  <p className="text-xl text-gray-600 font-medium">What would you like to know?</p>
                  <p className="text-sm text-gray-500 mt-2">Use one of the most common prompts below or use your own to begin</p>
                </div>

                {/* Suggestion Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {suggestionCards.map((card, index) => (
                    <Card 
                      key={index} 
                      className="cursor-pointer hover:shadow-md transition-shadow border border-gray-200 hover:border-gray-300"
                      onClick={() => handleSuggestionClick(card)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">{card.icon}</div>
                          <p className="text-sm text-gray-700 font-medium leading-relaxed">
                            {card.title}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Refresh Prompts */}
                <div className="text-center">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-gray-600 border-gray-200"
                    onClick={() => {
                      toast({
                        title: "Refreshed!",
                        description: "New prompts coming soon",
                      });
                    }}
                  >
                    🔄 Refresh Prompts
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Chat Messages */
            <ScrollArea className="h-full p-4">
              <div className="max-w-3xl mx-auto space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 ${
                      message.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.sender === "ai" && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback className="bg-green-500 text-white text-xs">
                          AI
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.sender === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                      <span className="text-xs opacity-70 mt-2 block">
                        {message.timestamp}
                      </span>
                    </div>
                    {message.sender === "user" && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback className="bg-blue-500 text-white text-xs">
                          J
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex gap-4 justify-start">
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="bg-green-500 text-white text-xs">
                        AI
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-100 rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-100 p-4 bg-white">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask whatever you want..."
                disabled={isTyping}
                className="pr-20 pl-12 py-4 text-base border-gray-200 focus:border-blue-400 rounded-full bg-gray-50 border-0 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
              
              {/* Left icons */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-gray-200"
                  onClick={() => toast({ title: "Feature coming soon!", description: "File attachment will be available soon" })}
                >
                  <Paperclip size={16} className="text-gray-400" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-gray-200"
                  onClick={() => toast({ title: "Feature coming soon!", description: "Image upload will be available soon" })}
                >
                  <Image size={16} className="text-gray-400" />
                </Button>
              </div>

              {/* Send button */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isTyping}
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100"
                  variant="secondary"
                >
                  {isTyping ? (
                    <Loader2 size={16} className="animate-spin text-gray-600" />
                  ) : (
                    <Send size={16} className="text-gray-600" />
                  )}
                </Button>
              </div>
            </div>
            
            <p className="text-xs text-gray-400 text-center mt-3">
              ChatGPT can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SettingsModal 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
      />
      
      <UserProfileModal 
        isOpen={profileOpen} 
        onClose={() => setProfileOpen(false)} 
      />
    </div>
  );
};

export default ChatInterface;