# ChatGPT Clone - Backend Integration Contracts

## API Contracts

### 1. Chat Management
```
POST /api/chats
- Create new chat session
- Returns: { id, title, createdAt }

GET /api/chats
- Get all user chats
- Returns: [{ id, title, preview, timestamp, messageCount }]

GET /api/chats/{chatId}
- Get specific chat details
- Returns: { id, title, messages: [...] }

DELETE /api/chats/{chatId}
- Delete a chat
- Returns: { success: true }

PUT /api/chats/{chatId}
- Update chat title
- Body: { title }
- Returns: { id, title, updatedAt }
```

### 2. Message Management
```
POST /api/chats/{chatId}/messages
- Send message to AI and get response
- Body: { message, sessionId }
- Returns: { userMessage: {...}, aiResponse: {...} }

GET /api/chats/{chatId}/messages
- Get all messages in a chat
- Returns: [{ id, text, sender, timestamp, chatId }]
```

### 3. AI Integration
```
POST /api/ai/chat
- Direct AI chat endpoint
- Body: { message, chatHistory?, sessionId }
- Returns: { response, usage }
```

## Mock Data to Replace

### From mockData.js:
1. **mockMessages** - Replace with real messages from MongoDB
2. **mockChatHistory** - Replace with actual user chat sessions
3. **Simulated AI responses** - Replace with real AI API calls

### Mock Functions to Replace:
1. `handleSendMessage()` - Connect to real AI API
2. `selectChat()` - Load real messages from backend
3. `startNewChat()` - Create actual chat session in database
4. Chat history loading - Fetch from API

## Backend Implementation Plan

### 1. Database Models
```javascript
// Chat Model
{
  _id: ObjectId,
  title: String,
  createdAt: Date,
  updatedAt: Date,
  messageCount: Number
}

// Message Model
{
  _id: ObjectId,
  chatId: ObjectId,
  text: String,
  sender: 'user' | 'ai',
  timestamp: Date,
  metadata: {
    model: String,
    usage: Object
  }
}
```

### 2. AI Integration
- Use Emergent LLM Key for OpenAI/Anthropic/Google
- Install emergentintegrations library
- Implement conversation context management
- Handle streaming responses (future enhancement)

### 3. API Endpoints Implementation
- Chat CRUD operations
- Message handling with AI integration
- Session management
- Error handling and validation

## Frontend Integration Changes

### 1. Remove Mock Dependencies
- Remove `mockData.js` imports
- Replace mock functions with API calls
- Add loading states for API requests

### 2. Add API Integration
- Create `api.js` utility for backend calls
- Update state management for real data
- Add error handling for failed requests
- Implement optimistic updates for better UX

### 3. Real-time Features
- Add proper message timestamps
- Implement chat session persistence
- Add message retry functionality
- Handle API rate limiting

## Integration Steps
1. ✅ Frontend mock implementation complete
2. 🔄 Create backend models and routes
3. 🔄 Integrate AI service (Emergent LLM)
4. 🔄 Replace frontend mock calls with real API
5. 🔄 Test full-stack functionality
6. 🔄 Add error handling and edge cases

## Success Criteria
- ✅ Real AI responses from backend
- ✅ Persistent chat sessions in database
- ✅ Seamless frontend-backend integration
- ✅ Proper error handling and loading states
- ✅ Chat history management
- ✅ New chat creation and deletion