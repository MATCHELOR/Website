from fastapi import FastAPI, APIRouter, HTTPException, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List
from datetime import datetime, timedelta

from models import (
    ChatModel, MessageModel, ChatCreateRequest, ChatUpdateRequest, 
    MessageCreateRequest, ChatResponse, MessageResponse, AIResponse
)
from ai_service import AIService

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Initialize AI service
ai_service = AIService()

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def format_timestamp(dt: datetime) -> str:
    """Format datetime for frontend display"""
    now = datetime.utcnow()
    diff = now - dt
    
    if diff.total_seconds() < 60:
        return "now"
    elif diff.total_seconds() < 3600:
        minutes = int(diff.total_seconds() / 60)
        return f"{minutes} min ago"
    elif diff.total_seconds() < 86400:
        hours = int(diff.total_seconds() / 3600)
        return f"{hours} hour{'s' if hours > 1 else ''} ago"
    else:
        days = int(diff.total_seconds() / 86400)
        return f"{days} day{'s' if days > 1 else ''} ago"

@api_router.get("/")
async def root():
    return {"message": "ChatGPT Clone API is running!"}

# Chat Management Endpoints
@api_router.post("/chats", response_model=ChatModel)
async def create_chat(request: ChatCreateRequest):
    """Create a new chat session"""
    try:
        chat = ChatModel(title=request.title)
        chat_dict = chat.dict()
        await db.chats.insert_one(chat_dict)
        logger.info(f"Created new chat: {chat.id}")
        return chat
    except Exception as e:
        logger.error(f"Error creating chat: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create chat")

@api_router.get("/chats", response_model=List[ChatResponse])
async def get_chats():
    """Get all chat sessions"""
    try:
        chats_cursor = db.chats.find().sort("updatedAt", -1)
        chats = await chats_cursor.to_list(1000)
        
        chat_responses = []
        for chat in chats:
            # Get the latest message for preview
            latest_message = await db.messages.find_one(
                {"chatId": chat["id"]}, 
                sort=[("timestamp", -1)]
            )
            
            preview = "Start a conversation..." if not latest_message else latest_message["text"][:100]
            if len(preview) == 100:
                preview += "..."
                
            chat_response = ChatResponse(
                id=chat["id"],
                title=chat["title"],
                preview=preview,
                timestamp=format_timestamp(chat["updatedAt"]),
                messageCount=chat.get("messageCount", 0)
            )
            chat_responses.append(chat_response)
            
        return chat_responses
    except Exception as e:
        logger.error(f"Error fetching chats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch chats")

@api_router.get("/chats/{chat_id}")
async def get_chat(chat_id: str):
    """Get specific chat details"""
    try:
        chat = await db.chats.find_one({"id": chat_id})
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
            
        messages_cursor = db.messages.find({"chatId": chat_id}).sort("timestamp", 1)
        messages = await messages_cursor.to_list(1000)
        
        # Remove MongoDB ObjectId fields to avoid serialization issues
        clean_messages = []
        for msg in messages:
            if '_id' in msg:
                del msg['_id']
            clean_messages.append(msg)
        
        return {
            "id": chat["id"],
            "title": chat["title"],
            "messages": clean_messages
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching chat {chat_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch chat")

@api_router.delete("/chats/{chat_id}")
async def delete_chat(chat_id: str):
    """Delete a chat and all its messages"""
    try:
        # Delete all messages in the chat
        await db.messages.delete_many({"chatId": chat_id})
        
        # Delete the chat
        result = await db.chats.delete_one({"id": chat_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Chat not found")
            
        logger.info(f"Deleted chat: {chat_id}")
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting chat {chat_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete chat")

@api_router.put("/chats/{chat_id}", response_model=ChatModel)
async def update_chat(chat_id: str, request: ChatUpdateRequest):
    """Update chat title"""
    try:
        update_data = {
            "title": request.title,
            "updatedAt": datetime.utcnow()
        }
        
        result = await db.chats.update_one(
            {"id": chat_id}, 
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Chat not found")
            
        updated_chat = await db.chats.find_one({"id": chat_id})
        return ChatModel(**updated_chat)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating chat {chat_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update chat")

# Message Management Endpoints
@api_router.post("/chats/{chat_id}/messages", response_model=AIResponse)
async def send_message(chat_id: str, request: MessageCreateRequest):
    """Send a message and get AI response"""
    try:
        # Check if chat exists
        chat = await db.chats.find_one({"id": chat_id})
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")

        # Create user message
        user_message = MessageModel(
            chatId=chat_id,
            text=request.message,
            sender="user"
        )

        # Save user message to database
        await db.messages.insert_one(user_message.dict())

        # Get chat history for context (last 10 messages)
        messages_cursor = db.messages.find({"chatId": chat_id}).sort("timestamp", -1).limit(10)
        recent_messages = await messages_cursor.to_list(10)
        recent_messages.reverse()  # Reverse to get chronological order

        # Get AI response
        ai_response_text = await ai_service.chat_with_ai(
            message=request.message,
            chat_history=recent_messages,
            session_id=request.sessionId or chat_id,
            model=request.model
        )

        # Create AI message
        ai_message = MessageModel(
            chatId=chat_id,
            text=ai_response_text,
            sender="ai"
        )

        # Save AI message to database
        await db.messages.insert_one(ai_message.dict())

        # Update chat metadata
        message_count = await db.messages.count_documents({"chatId": chat_id})
        
        # Update chat title if this is the first message
        update_data = {
            "messageCount": message_count,
            "updatedAt": datetime.utcnow()
        }
        
        if message_count <= 2:  # First user message and AI response
            try:
                suggested_title = await ai_service.get_chat_title_suggestion(request.message)
                update_data["title"] = suggested_title
            except Exception as e:
                logger.warning(f"Failed to generate title: {str(e)}")

        await db.chats.update_one({"id": chat_id}, {"$set": update_data})

        # Format response
        user_response = MessageResponse(
            id=user_message.id,
            text=user_message.text,
            sender=user_message.sender,
            timestamp=user_message.timestamp.strftime("%I:%M %p"),
            chatId=user_message.chatId
        )

        ai_response = MessageResponse(
            id=ai_message.id,
            text=ai_message.text,
            sender=ai_message.sender,
            timestamp=ai_message.timestamp.strftime("%I:%M %p"),
            chatId=ai_message.chatId
        )

        logger.info(f"Message exchange completed for chat {chat_id}")
        return AIResponse(userMessage=user_response, aiResponse=ai_response)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing message for chat {chat_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process message")

@api_router.get("/chats/{chat_id}/messages", response_model=List[MessageResponse])
async def get_messages(chat_id: str):
    """Get all messages in a chat"""
    try:
        # Check if chat exists
        chat = await db.chats.find_one({"id": chat_id})
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")

        messages_cursor = db.messages.find({"chatId": chat_id}).sort("timestamp", 1)
        messages = await messages_cursor.to_list(1000)

        message_responses = []
        for message in messages:
            message_response = MessageResponse(
                id=message["id"],
                text=message["text"],
                sender=message["sender"],
                timestamp=message["timestamp"].strftime("%I:%M %p"),
                chatId=message["chatId"]
            )
            message_responses.append(message_response)

        return message_responses
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching messages for chat {chat_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch messages")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()