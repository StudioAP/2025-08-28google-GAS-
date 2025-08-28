import { GoogleGenAI } from "@google/genai";
import { PROMPT } from '../constants';

// Define types locally to avoid potential path issues during Netlify build
interface ProcessedFilePart {
  inlineData: {
    mimeType: string;
    data: string;
  };
}

interface FilePayload {
    name: string;
    type: string;
    data: string; // base64 encoded
}

interface RequestBody {
    files: FilePayload[];
    inputText: string;
}

export default async (req: Request, context) => {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            return new Response(JSON.stringify({ error: "API_KEY environment variable not set." }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const ai = new GoogleGenAI({ apiKey });

        const { files, inputText } = (await req.json()) as RequestBody;

        // Combine all text parts into a single prompt for clarity
        let combinedText = PROMPT;

        if (inputText && inputText.trim()) {
            combinedText += "\n\n--- User Provided Text ---\n" + inputText.trim();
        }

        if (files && files.length > 0) {
            combinedText += "\n\n--- User Provided Files ---\n";
            files.forEach(file => {
                combinedText += `[File: ${file.name}]\n`;
            });
            combinedText += "\nProcess the content from the text above and the files below to generate the slideData.\n";
        }
        
        // Build the final parts array for the API call
        const finalParts: (({ text: string } | ProcessedFilePart))[] = [{ text: combinedText }];

        if (files && files.length > 0) {
            const fileParts: ProcessedFilePart[] = files.map(file => ({
                inlineData: {
                    mimeType: file.type,
                    data: file.data,
                }
            }));
            finalParts.push(...fileParts);
        }
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: finalParts },
        });

        let scriptText = response.text;
        // Clean up markdown code block fences if they exist
        if (scriptText.startsWith('```javascript')) {
            scriptText = scriptText.substring('```javascript'.length);
        } else if (scriptText.startsWith('```')) {
            scriptText = scriptText.substring('```'.length);
        }
        if (scriptText.endsWith('```')) {
            scriptText = scriptText.substring(0, scriptText.length - '```'.length);
        }

        return new Response(JSON.stringify({ script: scriptText.trim() }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
        return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
