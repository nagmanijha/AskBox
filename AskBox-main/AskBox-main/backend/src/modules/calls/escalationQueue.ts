import { logger } from '../../config/logger';

interface EscalatedCall {
    callId: string;
    reason: string;
    history: any[];
    timestamp: Date;
}

export class EscalationQueue {
    private queue: EscalatedCall[] = [];

    async escalate(callId: string, reason: string, history: any[]) {
        this.queue.push({
            callId,
            reason,
            history,
            timestamp: new Date()
        });
        logger.error(`[EscalationQueue] Call ${callId} escalated to HUMAN AGENT. Reason: ${reason}`);
    }

    getQueueDepth(): number {
        return this.queue.length;
    }
}

export const escalationQueue = new EscalationQueue();
