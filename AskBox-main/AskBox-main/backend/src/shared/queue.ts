import { logger } from '../config/logger';

interface Task {
    id: string;
    payload: any;
    retries: number;
    maxRetries: number;
}

export class AsyncQueue {
    private name: string;
    private queue: Task[] = [];
    private dlq: Task[] = [];
    private isProcessing = false;
    private processor: (payload: any) => Promise<void>;

    constructor(name: string, processor: (payload: any) => Promise<void>) {
        this.name = name;
        this.processor = processor;
    }

    /**
     * Push a task onto the async queue.
     */
    async enqueue(payload: any, maxRetries = 3) {
        const task: Task = {
            id: `task_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            payload,
            retries: 0,
            maxRetries
        };
        this.queue.push(task);
        logger.info(`[Queue:${this.name}] Enqueued task ${task.id} (Depth: ${this.queue.length})`);
        
        if (!this.isProcessing) {
            this.processNext();
        }
    }

    private async processNext() {
        if (this.queue.length === 0) {
            this.isProcessing = false;
            return;
        }

        this.isProcessing = true;
        const task = this.queue.shift()!;

        try {
            await this.processor(task.payload);
            logger.info(`[Queue:${this.name}] Successfully processed task ${task.id}`);
        } catch (error: any) {
            task.retries++;
            logger.warn(`[Queue:${this.name}] Task ${task.id} failed (${task.retries}/${task.maxRetries}). Error: ${error.message}`);
            
            if (task.retries >= task.maxRetries) {
                logger.error(`[Queue:${this.name}] Task ${task.id} exhausted retries. Moving to DLQ.`);
                this.dlq.push(task);
            } else {
                // Exponential backoff retry with Jitter to prevent thundering herds
                const baseBackoffMs = Math.pow(2, task.retries) * 1000;
                const jitterMs = Math.floor(Math.random() * 500);
                const backoffMs = baseBackoffMs + jitterMs;
                
                logger.info(`[Queue:${this.name}] Re-queueing task ${task.id} with ${backoffMs}ms backoff (incl. jitter).`);
                setTimeout(() => {
                    this.queue.push(task);
                    if (!this.isProcessing) this.processNext();
                }, backoffMs);
            }
        }

        // Process next immediately
        setImmediate(() => this.processNext());
    }

    getDLQSize(): number {
        return this.dlq.length;
    }
}
