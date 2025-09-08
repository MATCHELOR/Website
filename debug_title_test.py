#!/usr/bin/env python3
"""
Debug test for chat title auto-generation
"""

import asyncio
import aiohttp
import json

BACKEND_URL = "https://ai-chat-replica-17.preview.emergentagent.com/api"

async def debug_title_generation():
    async with aiohttp.ClientSession() as session:
        print("🔍 Debugging Chat Title Auto-Generation")
        
        # Step 1: Create a new chat
        print("1. Creating new chat...")
        chat_data = {"title": "New Chat"}
        async with session.post(
            f"{BACKEND_URL}/chats",
            json=chat_data,
            headers={"Content-Type": "application/json"}
        ) as response:
            if response.status != 200:
                print(f"❌ Failed to create chat: {response.status}")
                return
            new_chat = await response.json()
            chat_id = new_chat["id"]
            print(f"✅ Created chat: {chat_id}, Initial title: '{new_chat['title']}'")
        
        # Step 2: Send first message
        print("2. Sending first message...")
        message_data = {
            "message": "What are the benefits of renewable energy sources?",
            "sessionId": chat_id
        }
        async with session.post(
            f"{BACKEND_URL}/chats/{chat_id}/messages",
            json=message_data,
            headers={"Content-Type": "application/json"}
        ) as response:
            print(f"Message response status: {response.status}")
            if response.status == 200:
                msg_response = await response.json()
                print(f"✅ Message sent successfully")
                print(f"User message: {msg_response['userMessage']['text'][:50]}...")
                print(f"AI response: {msg_response['aiResponse']['text'][:50]}...")
            else:
                error_text = await response.text()
                print(f"❌ Failed to send message: {error_text}")
                return
        
        # Step 3: Check if title was updated (with delay)
        print("3. Checking title update...")
        await asyncio.sleep(2)  # Give some time for title generation
        
        async with session.get(f"{BACKEND_URL}/chats/{chat_id}") as response:
            print(f"Get chat response status: {response.status}")
            if response.status == 200:
                updated_chat = await response.json()
                new_title = updated_chat.get("title", "")
                print(f"Updated title: '{new_title}'")
                print(f"Message count: {updated_chat.get('messageCount', 0)}")
                
                if new_title != "New Chat" and len(new_title) > 0:
                    print("✅ Title auto-generation working!")
                else:
                    print("❌ Title was not auto-generated")
                    
                # Print full chat details for debugging
                print(f"Full chat details: {json.dumps(updated_chat, indent=2, default=str)}")
            else:
                error_text = await response.text()
                print(f"❌ Failed to get updated chat: {response.status} - {error_text}")
        
        # Step 4: Clean up
        print("4. Cleaning up...")
        async with session.delete(f"{BACKEND_URL}/chats/{chat_id}") as response:
            if response.status == 200:
                print("✅ Test chat deleted")
            else:
                print(f"⚠️ Failed to delete test chat: {response.status}")

if __name__ == "__main__":
    asyncio.run(debug_title_generation())