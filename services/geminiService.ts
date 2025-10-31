import { Content, GroundingChunk } from '@google/genai';
import { Language } from '../types';
import * as api from "./backendApiService";

// The client no longer needs to know if an API key is available.
// We assume the backend proxy is configured correctly.
export const isApiKeyAvailable = (): boolean => true;

export const generateText = async (prompt: string, language: Language, useGoogleSearch: boolean = false): Promise<{text: string, groundingChunks?: GroundingChunk[]}> => {
  try {
    // Call the backend proxy instead of the Gemini API directly
    const response = await api.proxyGenerateText(prompt, language, useGoogleSearch);
    return response; // Assuming backend returns in the format { text, groundingChunks? }
  } catch (error) {
    console.error('Error generating text via proxy:', error);
    throw error;
  }
};

// --- Chat Functionality Refactor ---
// The original `Chat` object from the SDK is stateful. When proxying, we make it stateless from the client's perspective.
// The client will send the message history with each request, and the backend will manage the conversation.

export interface ProxiedChat {
    history: Content[];
    language: Language;
}

export const startChat = (language: Language, history: Content[] = []): ProxiedChat => {
  // This no longer creates a connection to Google, it just sets up a local object to track conversation history.
  return {
      history: history,
      language: language
  };
};

export const sendMessageToChat = async (chat: ProxiedChat, message: string): Promise<{text: string, groundingChunks?: GroundingChunk[]}> => {
  try {
    // Add the user's new message to the history before sending
    chat.history.push({ role: "user", parts: [{ text: message }] });

    // Send the new message and the entire history to the backend proxy
    const response = await api.proxySendMessageToChat(message, chat.history, chat.language);
    
    // Add the AI's response to the history
    chat.history.push({ role: "model", parts: [{ text: response.text }] });

    return { text: response.text, groundingChunks: response.groundingChunks };
  } catch (error) {
    console.error('Error sending message to chat proxy:', error);
    // If the API call fails, remove the user message we optimistically added
    chat.history.pop();
    throw error;
  }
};

// This function can be kept as a client-side utility
export const parseJsonFromText = <T,>(text: string): T | null => {
  let jsonStr = text.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }
  try {
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    console.error("Failed to parse JSON response:", e, "Original text:", text);
    return null;
  }
};
