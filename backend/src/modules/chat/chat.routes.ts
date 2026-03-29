import { Router } from 'express';
import { chatController } from './chat.controller';

const router = Router();

router.post('/send', chatController.sendMessage);

export default router;
