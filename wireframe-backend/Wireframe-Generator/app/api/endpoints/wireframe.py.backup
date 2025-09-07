from http.client import HTTPException
from app.api.dependencies import get_cache
from app.models.wireframe import WireframeRequest, WireframeResponse
from app.services.wireframe.graph import generate_wireframe
from app.config import settings
from langchain_google_genai import ChatGoogleGenerativeAI
from langsmith import traceable
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import time
from typing import List, Dict, Any, Optional



router = APIRouter()


class ChatMessage(BaseModel):
    role: str
    content: str

class ConversationRequest(BaseModel):
    messages: List[ChatMessage]
    user_input: str

class ConversationResponse(BaseModel):
    response: str
    should_generate: bool = False


def get_conversation_llm():
    """Get LLM for conversation handling"""
    return ChatGoogleGenerativeAI(
        model=settings.DEFAULT_MODEL,
        api_key=settings.GOOGLE_API_KEY,
        temperature=0.7,
        max_tokens=None,
        timeout=None,
        max_retries=3,
    )

@router.post("/conversation", response_model=ConversationResponse)
@traceable
async def handle_conversation(request: ConversationRequest):
    """
    Handle intelligent conversation for wireframe requirements gathering.
    
    Args:
        request: ConversationRequest containing message history and new user input
        
    Returns:
        ConversationResponse with AI-generated response and generation flag
    """
    
    try:
        # Get conversation history
        conversation_history = "\n".join([f"{msg.role}: {msg.content}" for msg in request.messages])
        
        # Analyze if we can generate immediately based on knowledge
        user_input_lower = request.user_input.lower()
        
        # Knowledge-based immediate generation for common patterns
        common_patterns = [
            'website', 'homepage', 'landing page', 'site',
            'dashboard', 'admin panel', 'control panel',
            'e-commerce', 'shop', 'store', 'marketplace',
            'app', 'mobile app', 'application',
            'blog', 'news', 'article', 'content',
            'portfolio', 'profile', 'resume',
            'login', 'signup', 'authentication',
            'contact', 'about', 'services',
            'restaurant', 'cafe', 'food', 'menu',
            'booking', 'reservation', 'appointment',
            'fitness', 'gym', 'health', 'workout',
            'social', 'chat', 'messaging', 'forum',
            'education', 'learning', 'course', 'school',
            'finance', 'banking', 'payment', 'wallet'
        ]
        
        # Check if user described something we have knowledge about
        has_clear_pattern = any(pattern in user_input_lower for pattern in common_patterns)
        
        # Also check conversation history for patterns
        conversation_text = conversation_history.lower()
        has_pattern_in_history = any(pattern in conversation_text for pattern in common_patterns)
        
        # Count assistant messages
        assistant_messages = [msg for msg in request.messages if msg.role == 'assistant']
        question_count = len(assistant_messages)
        
        # Generate immediately if we recognize the pattern OR after 1 question
        if has_clear_pattern or has_pattern_in_history or question_count >= 1:
            return ConversationResponse(
                response="Perfect! I understand what you need. Let me create your wireframe using my knowledge of proven UI patterns and best practices.",
                should_generate=True
            )
        
        # Only ask ONE clarifying question if we truly don't understand
        prompt = f"""You are an expert UX/UI consultant with extensive knowledge of common interface patterns. 

User's input: {request.user_input}
Conversation: {conversation_history}

The user's request is unclear. Ask ONE simple question to understand what type of interface they want to create. 

Examples of good single questions:
- "What type of application are you looking to create - a website, mobile app, or dashboard?"
- "Is this for a business website, personal portfolio, or something else?"

Be brief and helpful. Ask only ONE question to clarify the project type:"""

        model = get_conversation_llm()
        response = model.invoke(prompt)
        
        # Check if AI thinks we should generate the wireframe
        should_generate = (
            "enough information" in response.content.lower() or
            "get started" in response.content.lower() or
            "create your wireframe" in response.content.lower()
        )
        
        return ConversationResponse(
            response=response.content,
            should_generate=should_generate
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Conversation error: {str(e)}")


@router.post("/generate", response_model=WireframeResponse)
async def create_wireframe(
    request: WireframeRequest, 
    background_tasks: BackgroundTasks, 
    cache= Depends(get_cache)
    ):
    """
    Generate a wireframe from a user query.
    
    Args:
        request: The user's description of the desired wireframe
        
    Returns:
        State containing the generated wireframe and intermediary data
    """

    if cache:
        cache_result = cache.get(request.user_query)
        if cache_result:
            return cache_result

    try:
        # generate the wireframe
        result = generate_wireframe(request.user_query)

        # check for errors
        if result.get("errors") and len(result['errors']) > 0:
            raise HTTPException(
                status_code=500, 
                detail={
                    "message": "Error generating wireframe",
                    "detailed_requirements": result['detailed_requirements'],
                    "wireframe_plan": result['wireframe_plan'],
                    "svg_code": result['svg_code'],
                    "errors": result['errors']
                }
            )
        
        # Prepare the response
        respnonse = WireframeResponse(
            svg_code = result['svg_code'],
            detailed_requirements = result.get('detailed_requirements'), 
            wireframe_plan = result.get('wireframe_plan'),
            errors = result.get('errors'),
            status = 200
        )

        # store in cache if enabled
        if cache:
            background_tasks.add_task(cache.set, request.user_query, respnonse)

        return respnonse
    
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "message": f"Error generating wireframe: {str(e)}"
            }
        )
    

@router.get("/health")
async def health_check():
    """
    Check the health of the API.
    """
    return {"status": "healthy", "timestamp": time.time()}


