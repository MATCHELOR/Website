import os
import logging
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage
from typing import List, Dict, Any
import asyncio

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not self.api_key:
            raise ValueError("EMERGENT_LLM_KEY not found in environment variables")
        
        logger.info("AIService initialized with Emergent LLM key")

    async def chat_with_ai(
        self, 
        message: str, 
        chat_history: List[Dict[str, Any]] = None,
        session_id: str = None,
        model: str = "gpt-4o-mini"
    ) -> str:
        """
        Send a message to AI and get response
        """
        try:
            # Create a unique session ID if not provided
            if not session_id:
                session_id = f"chat_{hash(message)}"

            # Initialize the chat with system message
            system_message = (
                "You are ChatGPT, a helpful AI assistant created by OpenAI. "
                "Provide helpful, accurate, and engaging responses to user questions. "
                "Be conversational and friendly while maintaining professionalism."
            )

            chat = LlmChat(
                api_key=self.api_key,
                session_id=session_id,
                system_message=system_message
            )

            # Use GPT-4o-mini as default model (cost-effective)
            chat.with_model("openai", "gpt-4o-mini")

            # If we have chat history, we should restore it
            # Note: For now, we'll send the current message
            # In a production system, you'd want to restore the full conversation context

            # Create user message
            user_message = UserMessage(text=message)
            
            # Send message and get response
            response = await chat.send_message(user_message)
            
            logger.info(f"AI response generated for session {session_id}")
            return response

        except Exception as e:
            logger.error(f"Error in AI chat: {str(e)}")
            # Return a fallback response instead of raising an error
            return (
                "I apologize, but I'm experiencing some technical difficulties right now. "
                "Please try again in a moment. This is a demo ChatGPT clone, and in the "
                "full production version, this would be connected to a more robust AI system."
            )

    async def get_chat_title_suggestion(self, first_message: str) -> str:
        """
        Generate a short title for a chat based on the first message
        """
        try:
            # Create a simple chat for title generation
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"title_{hash(first_message)}",
                system_message=(
                    "You are a helpful assistant that creates short, descriptive titles "
                    "for conversations. Generate a title that is 2-6 words long and "
                    "captures the main topic of the user's message. Return only the title, "
                    "nothing else."
                )
            )
            
            chat.with_model("openai", "gpt-4o-mini")
            
            title_message = UserMessage(
                text=f"Create a short title for this conversation starter: '{first_message}'"
            )
            
            title = await chat.send_message(title_message)
            
            # Clean up the title (remove quotes, extra text)
            title = title.strip().strip('"').strip("'")
            
            # Fallback to a simple title if the response is too long
            if len(title) > 50:
                title = "New Chat"
                
            return title

        except Exception as e:
            logger.error(f"Error generating chat title: {str(e)}")
            return "New Chat"