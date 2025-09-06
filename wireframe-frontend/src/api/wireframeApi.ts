import type { WireframeResponse } from "../types/types";

interface ChatMessage {
    role: string;
    content: string;
}

interface ConversationRequest {
    messages: ChatMessage[];
    user_input: string;
}

interface ConversationResponse {
    response: string;
    should_generate: boolean;
}

export const handleConversation = async (messages: ChatMessage[], userInput: string): Promise<ConversationResponse> => {
    try {
        const response = await fetch("/api/v1/wireframe/conversation", {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({ messages, user_input: userInput }),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error("Failed to handle conversation", error);
        throw error;
    }
};


export const generateWireframe = async (user_query: string): Promise<WireframeResponse> => {
    try{
        const response = await fetch("/api/v1/wireframe/generate", {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({user_query}),
        })

        if (!response.ok){
            throw new Error(`Error: ${response.status}`);
        }
        
        if (response.status === 200){
            return await response.json();
        }

        return {
            svg_code: "",
            errors: ["Failed to generate a wireframe"],
        };

    } catch (error) {
        console.error("'Failed to generate a wireframe", error)
        return {
            svg_code: "",
            errors: [(error as Error).message],
        }
    }
}