import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const performOCR = async (file: File): Promise<string> => {
    try {
        const base64Data = await fileToGenerativePart(file);
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64Data,
                            mimeType: file.type
                        }
                    },
                    {
                        text: "Perform Optical Character Recognition (OCR) on this document. Extract all readable text accurately, maintaining the structure and formatting where possible. Return only the extracted text."
                    }
                ]
            }
        });

        return response.text || "No text could be extracted.";
    } catch (error) {
        console.error("OCR Error:", error);
        // Return a meaningful fallback for local development if API key is not present
        if (!process.env.API_KEY) {
            return "OCR Simulation: [Please set your Gemini API key to see real extraction]. \n\nSample Extracted Content:\nProfessional PDF Management Platform\nCore Objectives & Technical Mandates...";
        }
        throw new Error("Failed to process OCR via Gemini. Check your connection or API key.");
    }
};

async function fileToGenerativePart(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            const base64Data = base64String.split(',')[1];
            resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}