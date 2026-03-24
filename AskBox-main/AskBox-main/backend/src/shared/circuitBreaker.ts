import { logger } from '../config/logger';

type BreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN' | 'DEGRADED';

/**
 * Simple Circuit Breaker implementation.
 */
export class CircuitBreaker {
    private state: BreakerState = 'CLOSED';
    private failureCount = 0;
    private threshold = 3;
    private resetTimeoutMs = 10000;
    private name: string;

    constructor(name: string, threshold = 3) {
        this.name = name;
        this.threshold = threshold;
    }

    async execute<T>(action: () => Promise<T>, fallback?: () => Promise<T>): Promise<T> {
        if (this.state === 'OPEN') {
            if (fallback) {
                logger.warn(`[CircuitBreaker:${this.name}] OPEN - Using fallback`);
                return fallback();
            }
            throw new Error(`Circuit ${this.name} is OPEN`);
        }

        try {
            const result = await action();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            if (fallback) {
                logger.warn(`[CircuitBreaker:${this.name}] DEGRADED - Using fallback after failure`);
                return fallback();
            }
            throw error;
        }
    }

    private onSuccess() {
        if (this.state === 'HALF_OPEN' || this.state === 'DEGRADED') {
            this.state = 'CLOSED';
            this.failureCount = 0;
            logger.info(`[CircuitBreaker:${this.name}] CLOSED - Recovered`);
        }
    }

    private onFailure() {
        this.failureCount++;
        if (this.failureCount >= this.threshold) {
            this.state = 'OPEN';
            logger.error(`[CircuitBreaker:${this.name}] OPEN - Threshold breached`);
            setTimeout(() => {
                this.state = 'HALF_OPEN';
                logger.info(`[CircuitBreaker:${this.name}] HALF_OPEN - Testing recovery`);
            }, this.resetTimeoutMs);
        } else {
            this.state = 'DEGRADED';
        }
    }

    getState(): BreakerState {
        return this.state;
    }
}

export const llmCircuitBreaker = new CircuitBreaker('vLLM_Inference', 2);
