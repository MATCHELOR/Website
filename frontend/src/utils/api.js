import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API,
  timeout: 30000, // 30 seconds timeout for AI responses
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const chatAPI = {
  // Chat management
  createChat: async (title = "New Chat") => {
    const response = await apiClient.post('/chats', { title });
    return response.data;
  },

  getChats: async () => {
    const response = await apiClient.get('/chats');
    return response.data;
  },

  getChat: async (chatId) => {
    const response = await apiClient.get(`/chats/${chatId}`);
    return response.data;
  },

  deleteChat: async (chatId) => {
    const response = await apiClient.delete(`/chats/${chatId}`);
    return response.data;
  },

  updateChat: async (chatId, title) => {
    const response = await apiClient.put(`/chats/${chatId}`, { title });
    return response.data;
  },

  // Message management
  sendMessage: async (chatId, message, sessionId = null) => {
    const response = await apiClient.post(`/chats/${chatId}/messages`, {
      message,
      sessionId
    });
    return response.data;
  },

  getMessages: async (chatId) => {
    const response = await apiClient.get(`/chats/${chatId}/messages`);
    return response.data;
  },
};

export default apiClient;