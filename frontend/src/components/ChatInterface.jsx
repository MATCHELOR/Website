import React, { useState, useRef, useEffect } from "react";
import { Send, Plus, User, Settings, Menu, MessageSquare, Edit3, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { mockChatHistory, mockMessages } from "../utils/mockData";
import { useToast } from "../hooks/use-toast";

const ChatInterface = () => {
  const [messages, setMessages] = useState(mockMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState(mockChatHistory);
  const [currentChatId, setCurrentChatId] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: inputValue,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        text: "I'm a mock ChatGPT response. In the full version, this would be connected to a real AI backend!",
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startNewChat = () => {
    const newChatId = Date.now();
    const newChat = {
      id: newChatId,
      title: "New Chat",
      preview: "Start a conversation...",
      timestamp: "now"
    };
    setChatHistory(prev => [newChat, ...prev]);
    setCurrentChatId(newChatId);
    setMessages([]);
    setSidebarOpen(false);
    toast({
      title: "New chat started",
      description: "Ready for your questions!",
    });
  };

  const selectChat = (chatId) => {
    setCurrentChatId(chatId);
    // In a real app, this would load the messages for that chat
    setMessages(mockMessages);
    setSidebarOpen(false);
  };

  const Sidebar = () => (
    <div className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      <div className="p-4">
        <Button onClick={startNewChat} className="w-full flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
          <Plus size={16} />
          New Chat
        </Button>
      </div>
      
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-2">
          {chatHistory.map((chat) => (
            <div
              key={chat.id}
              onClick={() => selectChat(chat.id)}
              className={`group p-3 rounded-lg cursor-pointer transition-colors ${
                currentChatId === chat.id
                  ? "bg-gray-200 dark:bg-gray-700"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {chat.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {chat.preview}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Edit3 size={12} />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {chat.timestamp}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              <User size={16} />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white">User</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Free Plan</p>
          </div>
          <Settings size={16} className="text-gray-400" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex bg-white dark:bg-gray-900">
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

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between bg-white dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
            </Sheet>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                <MessageSquare size={16} className="text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">ChatGPT</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Settings size={16} />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                <User size={16} />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare size={24} className="text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  How can I help you today?
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Start a conversation with ChatGPT
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.sender === "ai" && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="bg-gradient-to-br from-green-400 to-blue-500 text-white">
                        AI
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      message.sender === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp}
                    </span>
                  </div>
                  {message.sender === "user" && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="bg-blue-500 text-white">
                        <User size={16} />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))
            )}
            
            {isTyping && (
              <div className="flex gap-4 justify-start">
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback className="bg-gradient-to-br from-green-400 to-blue-500 text-white">
                    AI
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
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

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-2 items-end">
              <div className="flex-1 relative">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Message ChatGPT..."
                  className="pr-12 py-3 text-sm border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl bg-white dark:bg-gray-800"
                  multiline
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 rounded-lg"
                >
                  <Send size={16} />
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
              This is a mock ChatGPT interface. In the full version, messages would be powered by real AI.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;