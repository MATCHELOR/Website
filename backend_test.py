#!/usr/bin/env python3
"""
Comprehensive Backend Testing for Matchelor Real Estate AI
Tests all API endpoints, AI integration, and database operations
"""

import asyncio
import aiohttp
import json
import time
from datetime import datetime
from typing import Dict, List, Any

# Backend URL from frontend environment
BACKEND_URL = "https://ai-chat-replica-17.preview.emergentagent.com/api"

class ChatGPTBackendTester:
    def __init__(self):
        self.session = None
        self.test_results = []
        self.created_chat_id = None
        
    async def setup(self):
        """Initialize HTTP session"""
        self.session = aiohttp.ClientSession()
        
    async def cleanup(self):
        """Clean up resources"""
        if self.session:
            await self.session.close()
            
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })
        
    async def test_api_health(self):
        """Test 1: Basic API Health Check"""
        try:
            async with self.session.get(f"{BACKEND_URL}/") as response:
                if response.status == 200:
                    data = await response.json()
                    if "ChatGPT Clone API is running" in data.get("message", ""):
                        self.log_test("API Health Check", True, f"Status: {response.status}, Message: {data['message']}")
                        return True
                    else:
                        self.log_test("API Health Check", False, f"Unexpected message: {data}")
                        return False
                else:
                    self.log_test("API Health Check", False, f"Status: {response.status}")
                    return False
        except Exception as e:
            self.log_test("API Health Check", False, f"Exception: {str(e)}")
            return False
            
    async def test_create_chat(self):
        """Test 2: Create New Chat Session"""
        try:
            chat_data = {"title": "Test Chat Session"}
            async with self.session.post(
                f"{BACKEND_URL}/chats",
                json=chat_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    if "id" in data and "title" in data:
                        self.created_chat_id = data["id"]
                        self.log_test("Create Chat", True, f"Chat ID: {self.created_chat_id}, Title: {data['title']}")
                        return True
                    else:
                        self.log_test("Create Chat", False, f"Missing required fields in response: {data}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("Create Chat", False, f"Status: {response.status}, Error: {error_text}")
                    return False
        except Exception as e:
            self.log_test("Create Chat", False, f"Exception: {str(e)}")
            return False
            
    async def test_get_all_chats(self):
        """Test 3: Get All Chats"""
        try:
            async with self.session.get(f"{BACKEND_URL}/chats") as response:
                if response.status == 200:
                    data = await response.json()
                    if isinstance(data, list):
                        # Check if our created chat is in the list
                        found_chat = False
                        if self.created_chat_id:
                            for chat in data:
                                if chat.get("id") == self.created_chat_id:
                                    found_chat = True
                                    break
                        self.log_test("Get All Chats", True, f"Found {len(data)} chats, Created chat found: {found_chat}")
                        return True
                    else:
                        self.log_test("Get All Chats", False, f"Expected list, got: {type(data)}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("Get All Chats", False, f"Status: {response.status}, Error: {error_text}")
                    return False
        except Exception as e:
            self.log_test("Get All Chats", False, f"Exception: {str(e)}")
            return False
            
    async def test_get_specific_chat(self):
        """Test 4: Get Specific Chat Details"""
        if not self.created_chat_id:
            self.log_test("Get Specific Chat", False, "No chat ID available")
            return False
            
        try:
            async with self.session.get(f"{BACKEND_URL}/chats/{self.created_chat_id}") as response:
                if response.status == 200:
                    data = await response.json()
                    required_fields = ["id", "title", "messages"]
                    if all(field in data for field in required_fields):
                        self.log_test("Get Specific Chat", True, f"Chat details retrieved, Messages count: {len(data['messages'])}")
                        return True
                    else:
                        missing_fields = [field for field in required_fields if field not in data]
                        self.log_test("Get Specific Chat", False, f"Missing fields: {missing_fields}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("Get Specific Chat", False, f"Status: {response.status}, Error: {error_text}")
                    return False
        except Exception as e:
            self.log_test("Get Specific Chat", False, f"Exception: {str(e)}")
            return False
            
    async def test_update_chat_title(self):
        """Test 5: Update Chat Title"""
        if not self.created_chat_id:
            self.log_test("Update Chat Title", False, "No chat ID available")
            return False
            
        try:
            new_title = "Updated Test Chat Title"
            update_data = {"title": new_title}
            async with self.session.put(
                f"{BACKEND_URL}/chats/{self.created_chat_id}",
                json=update_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("title") == new_title:
                        self.log_test("Update Chat Title", True, f"Title updated to: {new_title}")
                        return True
                    else:
                        self.log_test("Update Chat Title", False, f"Title not updated correctly: {data.get('title')}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("Update Chat Title", False, f"Status: {response.status}, Error: {error_text}")
                    return False
        except Exception as e:
            self.log_test("Update Chat Title", False, f"Exception: {str(e)}")
            return False
            
    async def test_send_message_and_ai_response(self):
        """Test 6: Send Message and Get AI Response"""
        if not self.created_chat_id:
            self.log_test("Send Message & AI Response", False, "No chat ID available")
            return False
            
        try:
            message_data = {
                "message": "Hello! Can you tell me about artificial intelligence?",
                "sessionId": self.created_chat_id
            }
            async with self.session.post(
                f"{BACKEND_URL}/chats/{self.created_chat_id}/messages",
                json=message_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    required_fields = ["userMessage", "aiResponse"]
                    if all(field in data for field in required_fields):
                        user_msg = data["userMessage"]
                        ai_msg = data["aiResponse"]
                        
                        # Verify message structure
                        msg_fields = ["id", "text", "sender", "timestamp", "chatId"]
                        user_valid = all(field in user_msg for field in msg_fields)
                        ai_valid = all(field in ai_msg for field in msg_fields)
                        
                        if user_valid and ai_valid and user_msg["sender"] == "user" and ai_msg["sender"] == "ai":
                            self.log_test("Send Message & AI Response", True, 
                                        f"User message: '{user_msg['text'][:50]}...', AI response: '{ai_msg['text'][:50]}...'")
                            return True
                        else:
                            self.log_test("Send Message & AI Response", False, "Invalid message structure")
                            return False
                    else:
                        missing_fields = [field for field in required_fields if field not in data]
                        self.log_test("Send Message & AI Response", False, f"Missing fields: {missing_fields}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("Send Message & AI Response", False, f"Status: {response.status}, Error: {error_text}")
                    return False
        except Exception as e:
            self.log_test("Send Message & AI Response", False, f"Exception: {str(e)}")
            return False
            
    async def test_get_messages(self):
        """Test 7: Get Messages from Chat"""
        if not self.created_chat_id:
            self.log_test("Get Messages", False, "No chat ID available")
            return False
            
        try:
            async with self.session.get(f"{BACKEND_URL}/chats/{self.created_chat_id}/messages") as response:
                if response.status == 200:
                    data = await response.json()
                    if isinstance(data, list) and len(data) >= 2:  # Should have user + AI message
                        # Verify message ordering (chronological)
                        timestamps = [msg.get("timestamp", "") for msg in data]
                        self.log_test("Get Messages", True, f"Retrieved {len(data)} messages, Timestamps: {timestamps}")
                        return True
                    else:
                        self.log_test("Get Messages", False, f"Expected at least 2 messages, got: {len(data) if isinstance(data, list) else 'not a list'}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("Get Messages", False, f"Status: {response.status}, Error: {error_text}")
                    return False
        except Exception as e:
            self.log_test("Get Messages", False, f"Exception: {str(e)}")
            return False
            
    async def test_chat_title_auto_generation(self):
        """Test 8: Chat Title Auto-Generation"""
        try:
            # Create a new chat for this test
            chat_data = {"title": "New Chat"}
            async with self.session.post(
                f"{BACKEND_URL}/chats",
                json=chat_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                if response.status != 200:
                    self.log_test("Chat Title Auto-Generation", False, "Failed to create test chat")
                    return False
                    
                new_chat = await response.json()
                new_chat_id = new_chat["id"]
                
            # Send first message to trigger title generation
            message_data = {
                "message": "What are the benefits of renewable energy sources?",
                "sessionId": new_chat_id
            }
            async with self.session.post(
                f"{BACKEND_URL}/chats/{new_chat_id}/messages",
                json=message_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                if response.status != 200:
                    self.log_test("Chat Title Auto-Generation", False, "Failed to send message")
                    return False
                    
            # Check if title was updated
            async with self.session.get(f"{BACKEND_URL}/chats/{new_chat_id}") as response:
                if response.status == 200:
                    updated_chat = await response.json()
                    new_title = updated_chat.get("title", "")
                    if new_title != "New Chat" and len(new_title) > 0:
                        self.log_test("Chat Title Auto-Generation", True, f"Title auto-generated: '{new_title}'")
                        
                        # Clean up test chat
                        await self.session.delete(f"{BACKEND_URL}/chats/{new_chat_id}")
                        return True
                    else:
                        self.log_test("Chat Title Auto-Generation", False, f"Title not updated: '{new_title}'")
                        return False
                else:
                    self.log_test("Chat Title Auto-Generation", False, "Failed to retrieve updated chat")
                    return False
                    
        except Exception as e:
            self.log_test("Chat Title Auto-Generation", False, f"Exception: {str(e)}")
            return False
            
    async def test_error_handling_invalid_chat_id(self):
        """Test 9: Error Handling - Invalid Chat ID"""
        try:
            invalid_id = "invalid-chat-id-12345"
            async with self.session.get(f"{BACKEND_URL}/chats/{invalid_id}") as response:
                if response.status == 404:
                    self.log_test("Error Handling - Invalid Chat ID", True, f"Correctly returned 404 for invalid ID")
                    return True
                else:
                    self.log_test("Error Handling - Invalid Chat ID", False, f"Expected 404, got: {response.status}")
                    return False
        except Exception as e:
            self.log_test("Error Handling - Invalid Chat ID", False, f"Exception: {str(e)}")
            return False
            
    async def test_error_handling_missing_fields(self):
        """Test 10: Error Handling - Missing Required Fields"""
        try:
            # Try to send message without required field
            invalid_data = {}  # Missing 'message' field
            async with self.session.post(
                f"{BACKEND_URL}/chats/{self.created_chat_id}/messages" if self.created_chat_id else f"{BACKEND_URL}/chats/test/messages",
                json=invalid_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                if response.status in [400, 422]:  # Bad request or validation error
                    self.log_test("Error Handling - Missing Fields", True, f"Correctly returned {response.status} for missing fields")
                    return True
                else:
                    self.log_test("Error Handling - Missing Fields", False, f"Expected 400/422, got: {response.status}")
                    return False
        except Exception as e:
            self.log_test("Error Handling - Missing Fields", False, f"Exception: {str(e)}")
            return False
            
    async def test_ai_service_integration(self):
        """Test 11: AI Service Integration"""
        if not self.created_chat_id:
            self.log_test("AI Service Integration", False, "No chat ID available")
            return False
            
        try:
            # Send a specific question to test AI integration
            message_data = {
                "message": "What is 2 + 2?",
                "sessionId": self.created_chat_id
            }
            async with self.session.post(
                f"{BACKEND_URL}/chats/{self.created_chat_id}/messages",
                json=message_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    ai_response = data.get("aiResponse", {}).get("text", "")
                    
                    # Check if AI gave a reasonable response (should contain "4" for 2+2)
                    if len(ai_response) > 0 and ("4" in ai_response or "four" in ai_response.lower()):
                        self.log_test("AI Service Integration", True, f"AI correctly responded: '{ai_response[:100]}...'")
                        return True
                    elif len(ai_response) > 0:
                        # AI responded but maybe with fallback message
                        if "technical difficulties" in ai_response:
                            self.log_test("AI Service Integration", False, "AI service returned fallback error message")
                        else:
                            self.log_test("AI Service Integration", True, f"AI responded (may be creative): '{ai_response[:100]}...'")
                            return True
                        return False
                    else:
                        self.log_test("AI Service Integration", False, "Empty AI response")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("AI Service Integration", False, f"Status: {response.status}, Error: {error_text}")
                    return False
        except Exception as e:
            self.log_test("AI Service Integration", False, f"Exception: {str(e)}")
            return False
            
    async def test_delete_chat(self):
        """Test 12: Delete Chat (run last to clean up)"""
        if not self.created_chat_id:
            self.log_test("Delete Chat", False, "No chat ID available")
            return False
            
        try:
            async with self.session.delete(f"{BACKEND_URL}/chats/{self.created_chat_id}") as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("success") is True:
                        self.log_test("Delete Chat", True, f"Chat {self.created_chat_id} deleted successfully")
                        return True
                    else:
                        self.log_test("Delete Chat", False, f"Unexpected response: {data}")
                        return False
                else:
                    error_text = await response.text()
                    self.log_test("Delete Chat", False, f"Status: {response.status}, Error: {error_text}")
                    return False
        except Exception as e:
            self.log_test("Delete Chat", False, f"Exception: {str(e)}")
            return False
            
    async def run_all_tests(self):
        """Run all backend tests in sequence"""
        print(f"🚀 Starting ChatGPT Clone Backend Tests")
        print(f"📡 Backend URL: {BACKEND_URL}")
        print("=" * 60)
        
        await self.setup()
        
        # Test sequence
        tests = [
            self.test_api_health,
            self.test_create_chat,
            self.test_get_all_chats,
            self.test_get_specific_chat,
            self.test_update_chat_title,
            self.test_send_message_and_ai_response,
            self.test_get_messages,
            self.test_chat_title_auto_generation,
            self.test_error_handling_invalid_chat_id,
            self.test_error_handling_missing_fields,
            self.test_ai_service_integration,
            self.test_delete_chat,
        ]
        
        passed = 0
        failed = 0
        
        for test in tests:
            try:
                result = await test()
                if result:
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                print(f"❌ FAIL {test.__name__}: Unexpected error: {str(e)}")
                failed += 1
            
            # Small delay between tests
            await asyncio.sleep(0.5)
            
        await self.cleanup()
        
        print("=" * 60)
        print(f"📊 Test Results Summary:")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {(passed/(passed+failed)*100):.1f}%")
        
        return passed, failed, self.test_results

async def main():
    """Main test runner"""
    tester = ChatGPTBackendTester()
    passed, failed, results = await tester.run_all_tests()
    
    # Save detailed results
    with open("/app/backend_test_results.json", "w") as f:
        json.dump({
            "summary": {
                "passed": passed,
                "failed": failed,
                "total": passed + failed,
                "success_rate": (passed/(passed+failed)*100) if (passed+failed) > 0 else 0
            },
            "tests": results,
            "timestamp": datetime.now().isoformat()
        }, f, indent=2)
    
    print(f"\n📄 Detailed results saved to: /app/backend_test_results.json")
    
    return passed == len(results)  # Return True if all tests passed

if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1)