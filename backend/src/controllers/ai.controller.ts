import { Request, Response } from 'express';
import { ErrorMessages, createErrorResponse } from '../utils/errorMessages';

export const proxyGenerateText = async (req: Request, res: Response) => {
  try {
    const { prompt, language, useGoogleSearch } = req.body;
    res.json({
      text: `Mock generated response for: ${prompt}`,
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
    const response = `Mock AI response to: ${message}`;
    res.json({
      response,
      language,
      history: [...history, { role: 'user', content: message }, { role: 'assistant', content: response }]
    });
  } catch (error) {
    console.error('Error sending message to chat:', error);
    res.status(500).json(createErrorResponse(ErrorMessages.CHAT_FAILED));
  }
};