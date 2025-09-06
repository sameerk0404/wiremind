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
        
        # Count previous assistant messages to limit questions
        assistant_messages = [msg for msg in request.messages if msg.role == 'assistant']
        question_count = len(assistant_messages)
        
        # Create prompt for intelligent conversation with question limit
        prompt = f"""You are an expert UX/UI consultant helping users create wireframes. Your job is to ask intelligent, context-specific questions to gather enough information to create the perfect wireframe.

Conversation so far:
{conversation_history}

User's latest input: {request.user_input}

CRITICAL CONSTRAINT: You have asked {question_count} questions already. You MUST generate the wireframe after asking a MAXIMUM of 3-4 questions total.

INSTRUCTIONS:
1. Analyze what the user has told you so far about their wireframe needs
2. If you have asked 3+ questions OR have enough basic information, respond with "Perfect! I have enough information to create your wireframe. Let me get started!" and I'll set should_generate=true
3. If you have asked fewer than 3 questions and need ONE more critical piece of info, ask it
4. NEVER ask more than 4 questions total - users want quick results

ESSENTIAL INFO TO GATHER (pick the most important missing piece):
1. Project type/purpose (website, app, dashboard, etc.)
2. Key features/functionality needed
3. Platform (desktop/mobile/responsive)

RULES:
- Ask only ONE question at a time
- After 3-4 questions, ALWAYS offer to generate
- Be conversational and helpful
- Don't ask about minor details like colors or exact styling
- Focus on functional requirements only

Your response should be a natural, helpful question or statement (not JSON, just plain text):"""

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


