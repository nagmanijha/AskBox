import { logger } from '../config/logger';

/**
 * EventBus - Simulating a Kafka/Event Mesh for a distributed architecture.
 */
class EventBus {
    private listeners: Record<string, Function[]> = {};

    publish(topic: string, message: any) {
        logger.info(`[EventBus] Published to topic [${topic}]`);
        if (this.listeners[topic]) {
            this.listeners[topic].forEach(fn => fn(message));
        }
    }

    subscribe(topic: string, listener: (...args: any[]) => void) {
        if (!this.listeners[topic]) {
            this.listeners[topic] = [];
        }
        this.listeners[topic].push(listener);
    }
}

export const eventBus = new EventBus();
