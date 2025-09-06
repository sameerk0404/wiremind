import type { WireframeResponse } from "../types/types";

export const generateWireframe = async (user_query: string): Promise<WireframeResponse> => {
    try{
        const response = await fetch("https://9288272f-a7f8-400a-bafe-0ffe568ea7d5-00-1u3ocgi6yuv29.pike.replit.dev:8000/api/v1/wireframe/generate", {
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