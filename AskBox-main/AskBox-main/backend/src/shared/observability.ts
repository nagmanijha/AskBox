import { v4 as uuidv4 } from 'uuid';
import { logger } from '../config/logger';

export interface TraceContext {
    traceId: string;
    spanId: string;
    parentSpanId?: string;
    startTime: number;
}

export class ObservabilityService {
    /**
     * Starts a new distributed trace (e.g., when a call arrives).
     */
    startTrace(name: string): TraceContext {
        const traceId = `tr_${uuidv4().replace(/-/g, '').substring(0, 16)}`;
        const spanId = `sp_${uuidv4().replace(/-/g, '').substring(0, 8)}`;
        
        logger.info(`[OTel] Started Trace: ${name} [TraceID: ${traceId}, SpanID: ${spanId}]`);
        
        return {
            traceId,
            spanId,
            startTime: Date.now()
        };
    }

    /**
     * Creates a child span for a specific operation (e.g., RAG retrieval).
     */
    startChildSpan(parent: TraceContext, name: string): TraceContext {
        const spanId = `sp_${uuidv4().replace(/-/g, '').substring(0, 8)}`;
        
        logger.info(`[OTel]   -> Started Child Span: ${name} [TraceID: ${parent.traceId}, SpanID: ${spanId}]`);
        
        return {
            traceId: parent.traceId,
            spanId,
            parentSpanId: parent.spanId,
            startTime: Date.now()
        };
    }

    /**
     * Ends a span and calculates latency.
     */
    endSpan(context: TraceContext, name: string, status: 'OK' | 'ERROR' = 'OK') {
        const latency = Date.now() - context.startTime;
        const color = status === 'OK' ? '\x1b[32m' : '\x1b[31m'; // Green or Red
        logger.info(`[OTel]   <- Ended Span: ${name} [SpanID: ${context.spanId}] - ${color}${status}\x1b[0m (${latency}ms)`);
        return latency;
    }
}

export const tracer = new ObservabilityService();
