from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid

class MessageModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    chatId: str
    text: str
    sender: str  # 'user' or 'ai'
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Optional[dict] = Field(default_factory=dict)

class ChatModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    messageCount: int = Field(default=0)

class ChatCreateRequest(BaseModel):
    title: Optional[str] = Field(default="New Chat")

class ChatUpdateRequest(BaseModel):
    title: str

class MessageCreateRequest(BaseModel):
    message: str
    sessionId: Optional[str] = None

class ChatResponse(BaseModel):
    id: str
    title: str
    preview: str
    timestamp: str
    messageCount: int

class MessageResponse(BaseModel):
    id: str
    text: str
    sender: str
    timestamp: str
    chatId: str

class AIResponse(BaseModel):
    userMessage: MessageResponse
    aiResponse: MessageResponse