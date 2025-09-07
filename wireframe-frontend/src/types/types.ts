export interface WireframeResponse {
    svg_code: string;
    detailed_requirements?: Record<string, any>;
    wireframe_plan?: Record<string, any>;
    errors?: string[];
    status?: number;
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export interface ConversationResponse {
    response: string;
    should_generate: boolean;
}
