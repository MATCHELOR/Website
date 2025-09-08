import React, { useState, useRef, useEffect } from "react";
import { Send, Plus, User, Settings, Menu, MessageSquare, Edit3, Trash2, Loader2, Paperclip, Image, MoreHorizontal, AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Card, CardContent } from "./ui/card";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
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
    if (e) e.stopPropagation();
    
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

  const handleDeleteClick = (chatId, e) => {
    e.stopPropagation();
    setChatToDelete(chatId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteChat = () => {
    if (chatToDelete) {
      deleteChat(chatToDelete);
      setDeleteDialogOpen(false);
      setChatToDelete(null);
    }
  };

  const deleteAllChats = async () => {
    try {
      // Delete all chats
      const deletePromises = chatHistory.map(chat => chatAPI.deleteChat(chat.id));
      await Promise.all(deletePromises);
      
      // Clear local state
      setChatHistory([]);
      setCurrentChatId(null);
      setMessages([]);
      
      toast({
        title: "All chats deleted",
        description: "All chat history has been cleared",
      });
      
    } catch (error) {
      console.error('Error deleting all chats:', error);
      toast({
        title: "Error",
        description: "Failed to delete all chats",
        variant: "destructive"
      });
    }
  };

  const confirmDeleteAllChats = () => {
    deleteAllChats();
    setDeleteAllDialogOpen(false);
  };

  const clearCurrentChat = () => {
    if (currentChatId) {
      setChatToDelete(currentChatId);
      setDeleteDialogOpen(true);
    }
  };

  const Sidebar = () => (
    <div className="w-64 bg-white border-r border-gray-100 flex flex-col h-full">
      {/* Sidebar Header with Logo */}
      <div className="p-3 border-b border-gray-100">
        {/* Logo Section */}
        <div className="flex items-center gap-3 mb-3">
          <img 
            src="https://customer-assets.emergentagent.com/job_ai-chat-replica-17/artifacts/odu2ae3v_noBgBlack%20onlylogo.png" 
            alt="Matchelor Logo" 
            className="h-8 w-8 object-contain"
          />
          <span className="text-lg font-semibold text-gray-900">Matchelor</span>
        </div>
        
        {/* New Chat Button */}
        <div className="flex items-center justify-between">
          <Button 
            onClick={startNewChat} 
            disabled={isLoading}
            variant="ghost"
            className="flex-1 justify-start text-sm font-normal px-3 py-2 h-auto mr-2"
          >
            <Plus size={16} className="mr-2" />
            New chat
          </Button>
          
          {/* Delete All Chats Button */}
          {chatHistory.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <MoreHorizontal size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  className="text-red-600 focus:text-red-600"
                  onClick={() => setDeleteAllDialogOpen(true)}
                >
                  <Trash2 size={14} className="mr-2" />
                  Clear all chats
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
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
                className={`group px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm mb-1 relative ${
                  currentChatId === chat.id
                    ? "bg-gray-100"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-gray-900 truncate font-medium">
                      {chat.title}
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                      onClick={(e) => handleDeleteClick(chat.id, e)}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {chatHistory.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No chats yet</p>
                <p className="text-xs">Start a new conversation!</p>
              </div>
            )}
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
        <div className="px-4 py-3 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
            </Sheet>
          </div>
          <div className="flex items-center gap-2">
            {/* Clear History Button (visible when there are messages) */}
            {messages.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearCurrentChat}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 size={16} className="mr-1" />
                Clear
              </Button>
            )}
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
              <div className="max-w-4xl w-full">
                {/* Welcome Message */}
                <div className="text-center mb-16">
                  <h1 className="text-5xl font-semibold text-gray-900 mb-3">
                    Hi there, John
                  </h1>
                  <h2 className="text-xl font-bold text-gray-700 mb-4">How may I help you today?</h2>
                  <p className="text-base text-gray-500">I can help you find properties, answer questions about real estate, and provide personalized recommendations.</p>
                </div>

                {/* Input Area - Moved Above Suggestion Cards */}
                <div className="mb-8">
                  <div className="relative">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask whatever you want..."
                      disabled={isTyping}
                      className="pr-20 pl-16 py-6 text-base border-gray-200 focus:border-blue-400 rounded-full bg-gray-50 border-0 focus:bg-white focus:ring-2 focus:ring-blue-100 h-14"
                    />
                    
                    {/* Left icons */}
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-3">
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
                        className="h-10 w-10 p-0 rounded-full bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100"
                        variant="secondary"
                      >
                        {isTyping ? (
                          <Loader2 size={18} className="animate-spin text-gray-600" />
                        ) : (
                          <Send size={18} className="text-gray-600" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Suggestion Cards - Now Below Input */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                  {suggestionCards.map((card, index) => (
                    <Card 
                      key={index} 
                      className="cursor-pointer hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-gray-300"
                      onClick={() => handleSuggestionClick(card)}
                    >
                      <CardContent className="p-4">
                        <p className="text-xs text-gray-700 font-medium leading-relaxed">
                          {card.title}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Privacy Disclaimer */}
                <div className="text-center">
                  <p className="text-xs text-gray-400">
                    By using Matchelor, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Chat Messages */
            <ScrollArea className="h-full">
              <div className="max-w-4xl mx-auto px-4 py-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start gap-3 ${
                        message.sender === "user" ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className={`text-xs text-white ${
                            message.sender === "user" 
                              ? "bg-blue-500" 
                              : "bg-green-500"
                          }`}>
                            {message.sender === "user" ? "J" : "AI"}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      
                      {/* Message Content */}
                      <div className={`flex-1 max-w-[70%] ${
                        message.sender === "user" ? "text-right" : "text-left"
                      }`}>
                        <div
                          className={`inline-block rounded-2xl px-4 py-3 ${
                            message.sender === "user"
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {message.text}
                          </p>
                          <span className="text-xs opacity-70 mt-1 block">
                            {message.timestamp}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-green-500 text-white text-xs">
                            AI
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 max-w-[70%]">
                        <div className="inline-block bg-gray-100 rounded-2xl px-4 py-3">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Input Area - Only show when there are messages */}
        {messages.length > 0 && (
          <div className="border-t border-gray-100 p-4 bg-white">
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask whatever you want..."
                  disabled={isTyping}
                  className="pr-20 pl-16 py-6 text-base border-gray-200 focus:border-blue-400 rounded-full bg-gray-50 border-0 focus:bg-white focus:ring-2 focus:ring-blue-100 h-14"
                />
                
                {/* Left icons */}
                <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-3">
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
                    className="h-10 w-10 p-0 rounded-full bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100"
                    variant="secondary"
                  >
                    {isTyping ? (
                      <Loader2 size={18} className="animate-spin text-gray-600" />
                    ) : (
                      <Send size={18} className="text-gray-600" />
                    )}
                  </Button>
                </div>
              </div>
              
              <p className="text-xs text-gray-400 text-center mt-3">
                By using Matchelor, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modals and Dialogs */}
      <SettingsModal 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
      />
      
      <UserProfileModal 
        isOpen={profileOpen} 
        onClose={() => setProfileOpen(false)} 
      />

      {/* Delete Individual Chat Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Delete Chat
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this chat? This action cannot be undone and all messages in this conversation will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteChat}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Chat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete All Chats Confirmation Dialog */}
      <AlertDialog open={deleteAllDialogOpen} onOpenChange={setDeleteAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Clear All Chat History
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all {chatHistory.length} chats? This action cannot be undone and all your conversation history will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteAllChats}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete All Chats
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ChatInterface;