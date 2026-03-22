
import { ragService } from './src/azure/ragService';
import { searchService } from './src/azure/searchClient';
import { redisService } from './src/azure/redisClient';
import { ConversationTurn } from './src/shared/types';
import dotenv from 'dotenv';
import { logger } from './src/config/logger';

// Load environment variables
dotenv.config();

async function testRAG() {
    console.log('🚀 Testing RAG Service...');

    // Initialize services
    await redisService.initialize();
    searchService.initialize();

    const history: ConversationTurn[] = [];

    // Test case 1: Known concept (should be in mock or search)
    const query1 = "What is photosynthesis?";
    console.log(`\n❓ Query: "${query1}"`);
    
    try {
        const result1 = await ragService.retrieveAndAssemble(query1, "en-IN", history);
        console.log(`✅ Result Source: ${result1.retrievalSource}`);
        console.log(`⏱️ Latency: ${result1.retrievalLatencyMs}ms`);
        console.log(`📄 Context Length: ${result1.context.length}`);
        if(result1.context.length > 0) {
            console.log(`📝 Context Snippet: ${result1.context.substring(0, 100).replace(/\n/g, ' ')}...`);
        } else {
             console.log(`⚠️ No context retrieved.`);
        }
    } catch (error) {
        console.error('❌ Error testing RAG:', error);
    }

    // Test case 2: Unknown concept (should use fallback or general knowledge if search fails)
    const query2 = "Explain the Quantum Hall Effect in detail.";
    console.log(`\n❓ Query: "${query2}"`);

    try {
        const result2 = await ragService.retrieveAndAssemble(query2, "en-IN", history);
        console.log(`✅ Result Source: ${result2.retrievalSource}`);
        console.log(`⏱️ Latency: ${result2.retrievalLatencyMs}ms`);
        console.log(`📄 Context Length: ${result2.context.length}`);
    } catch (error) {
        console.error('❌ Error testing RAG:', error);
    }
    
    // Allow logs to flush
    setTimeout(() => process.exit(0), 1000);
}

testRAG();

