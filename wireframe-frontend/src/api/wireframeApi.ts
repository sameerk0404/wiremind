import type { WireframeResponse } from "../types/types";
import axios from 'axios';

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

const axiosInstance = axios.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json',
    }
});

export const handleConversation = async (messages: ChatMessage[], user_input: string): Promise<ConversationResponse> => {
    try {
        const response = await axiosInstance.post('/wireframe/conversation', { 
            messages: messages.map(m => ({
                role: m.role,
                content: m.content
            })),
            user_input: user_input
        });
        return response.data as ConversationResponse;
    } catch (error: any) {
        console.error('Error in handleConversation:', error);
        if (error.response?.status === 500) {
            return {
                response: "I'm having trouble connecting to my AI service. Please try again in a moment.",
                should_generate: false
            };
        }
        return {
            response: "I'm having trouble processing your request. Please try again.",
            should_generate: false
        };
    }
};

export const generateWireframe = async (user_query: string): Promise<WireframeResponse> => {
    try {
        const response = await axiosInstance.post<Omit<WireframeResponse, 'status'>>('/wireframe/generate', { user_query });
        return {
            ...response.data,
            status: response.status
        };
    } catch (error: any) {
        console.error("Failed to generate wireframe", error);
        if (error.response?.data?.detail) {
            return {
                svg_code: "",
                detailed_requirements: error.response.data.detail.detailed_requirements,
                wireframe_plan: error.response.data.detail.wireframe_plan,
                errors: error.response.data.detail.errors || [error.response.data.detail.message],
                status: error.response.status
            };
        }
        return {
            svg_code: "",
            errors: [error.response?.data?.message || "There was a problem generating your wireframe. Please try again."],
            status: error.response?.status || 500
        };
    }
};

export const convertImageToWireframe = async (file: File): Promise<WireframeResponse> => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await axiosInstance.post<Omit<WireframeResponse, 'status'>>('/wireframe/image-to-wireframe', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return {
            ...response.data,
            status: response.status
        };
    } catch (error: any) {
        console.error("Failed to convert image", error);
        if (error.response?.data?.detail) {
            return {
                svg_code: "",
                errors: [error.response?.data?.detail || "Failed to convert image to wireframe"],
                status: error.response?.status || 500
            };
        }
        return {
            svg_code: "",
            errors: ["Failed to convert image to wireframe"],
            status: 500
        };
    }
};