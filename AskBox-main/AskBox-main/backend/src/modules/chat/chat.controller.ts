import { Request, Response } from 'express';
import { llmService } from '../../azure/llmService';
import { logger } from '../../config/logger';

export const chatController = {
    async sendMessage(req: Request, res: Response) {
        try {
            const { messages } = req.body;

            if (!messages || !Array.isArray(messages)) {
                return res.status(400).json({ success: false, error: 'Messages array is required' });
            }

            const mappedMessages = messages.map((m: any) => {
                if (m.image) {
                    return {
                        role: m.role,
                        content: [
                            { type: 'text', text: m.content || 'तस्वीर का विश्लेषण करें।' },
                            { type: 'image_url', image_url: { url: m.image } }
                        ]
                    };
                }
                return {
                    role: m.role,
                    content: m.content
                };
            });

            // Simple Azure OpenAI call
            const response = await llmService.generateCompletion({
                messages: mappedMessages
            });

            res.json({ success: true, data: response });
        } catch (error) {
            logger.error('[Chat] Failed to send message', error);
            res.status(500).json({ success: false, error: 'Failed to get response from AI' });
        }
    }
};
