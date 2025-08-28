
import { GoogleGenAI } from "@google/genai";
import { PROMPT } from '../constants';
import { fileToGenerativePart } from '../utils/fileProcessor';
import { ProcessedFilePart } from "../types";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set. This app requires a configured Gemini API key to function.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateGasScript = async (files: File[], inputText: string): Promise<string> => {
  const contentParts: ({ text: string } | ProcessedFilePart)[] = [{ text: PROMPT }];

  if (inputText.trim()) {
    contentParts.push({ text: "\n\n--- User Provided Text ---\n" });
    contentParts.push({ text: inputText.trim() });
  }

  if (files.length > 0) {
    const fileProcessingPromises = files.map(file => fileToGenerativePart(file));
    const fileParts = await Promise.all(fileProcessingPromises);
    
    contentParts.push({ text: "\n\n--- User Provided Files Content ---\n" });
    contentParts.push(...files.map(file => ({ text: `\n[File: ${file.name}]\n` })));
    contentParts.push(...fileParts);
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: contentParts },
  });
  
  // Clean up markdown code block delimiters if the model includes them
  let scriptText = response.text;
  if (scriptText.startsWith('```javascript')) {
    scriptText = scriptText.substring('```javascript'.length);
  } else if (scriptText.startsWith('```')) {
     scriptText = scriptText.substring('```'.length);
  }
  if (scriptText.endsWith('```')) {
    scriptText = scriptText.substring(0, scriptText.length - '```'.length);
  }

  return scriptText.trim();
};
