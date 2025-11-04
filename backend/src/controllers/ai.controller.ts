import { Request, Response } from 'express';
import { ENV } from '../config/environment';
import { ErrorMessages, createErrorResponse } from '../utils/errorMessages';
import GeminiModelService from '../services/geminiModelService';

const modelService = GeminiModelService.getInstance();

export const proxyGenerateText = async (req: Request, res: Response) => {
  try {
    const { prompt, language, useGoogleSearch } = req.body;
    
    if (!ENV.GEMINI_API_KEY) {
      return res.status(500).json(createErrorResponse('Gemini API key not configured'));
    }

    // Add instruction for chart/diagram requests
    let enhancedPrompt = prompt;
    if (prompt.toLowerCase().includes('chart') || prompt.toLowerCase().includes('diagram') || prompt.toLowerCase().includes('graph')) {
      enhancedPrompt = `${prompt}\n\nIMPORTANT: If creating a chart or diagram, please provide it in Mermaid syntax format. Start with the diagram type (like 'graph TD', 'pie title', 'flowchart TD', etc.) and use proper Mermaid syntax.`;
    }

    // Get working model dynamically
    await modelService.getWorkingModel();
    const model = modelService.getGenerativeModel();
    
    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    const text = response.text();

    res.json({
      text,
      language,
      usedGoogleSearch: useGoogleSearch
    });
  } catch (error) {
    console.error('Error generating text:', error);
    res.status(500).json(createErrorResponse(ErrorMessages.TEXT_GENERATION_FAILED));
  }
};

export const proxySendMessageToChat = async (req: Request, res: Response) => {
  try {
    const { message, history, language } = req.body;
    
    if (!ENV.GEMINI_API_KEY) {
      return res.status(500).json(createErrorResponse('Gemini API key not configured'));
    }

    // Add instruction for chart/diagram requests
    let enhancedMessage = message;
    if (message.toLowerCase().includes('chart') || message.toLowerCase().includes('diagram') || message.toLowerCase().includes('graph')) {
      enhancedMessage = `${message}\n\nIMPORTANT: If creating a chart or diagram, please provide it in Mermaid syntax format. Start with the diagram type (like 'graph TD', 'pie title', 'flowchart TD', etc.) and use proper Mermaid syntax.`;
    }

    // Get working model dynamically
    await modelService.getWorkingModel();
    const model = modelService.getGenerativeModel();
    
    const chat = model.startChat({
      history: history.map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : msg.role,
        parts: [{ text: msg.content || msg.parts?.[0]?.text || '' }]
      }))
    });

    const result = await chat.sendMessage(enhancedMessage);
    const response = result.response.text();

    res.json({
      text: response,
      language,
      groundingChunks: []
    });
  } catch (error) {
    console.error('Error sending message to chat:', error);
    res.status(500).json(createErrorResponse(ErrorMessages.CHAT_FAILED));
  }
};