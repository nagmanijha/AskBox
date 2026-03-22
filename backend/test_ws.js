const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3001/acs-audio?callId=test_script&language=hi-IN');

ws.on('open', () => {
    console.log('Connected to backend WebSocket');
    
    // Simulate first packet PCM logic
    const dummyPcm = Buffer.alloc(4096, 0);
    console.log('Sending dummy PCM audio bytes...');
    ws.send(dummyPcm);
    
    setTimeout(() => {
        console.log('Sending Transcript fallback event...');
        ws.send(JSON.stringify({
            kind: 'Transcript',
            text: 'Mera naam Rajesh hai. Please tell me about farmer schemes.',
            language: 'hi-IN'
        }));
    }, 1000);
});

ws.on('message', (data) => {
    try {
        const text = data.toString();
        if (text[0] === '{') {
            const json = JSON.parse(text);
            if (json.kind === 'TextResponse') {
                console.log('\n✅ [SUCCESS] Received Text Response from LLM:\n', json.text);
                process.exit(0);
            } else {
                console.log('Received JSON:', json.kind);
            }
        } else {
            console.log(`\n✅ [SUCCESS] Received Binary Audio Chunk: ${data.length} bytes`);
        }
    } catch (e) {
        console.log('Raw message:', data.length, 'bytes');
    }
});

ws.on('error', (err) => {
    console.error('WebSocket Error:', err);
});

ws.on('close', () => {
    console.log('Connection closed');
    process.exit(0);
});

// Auto-exit after 35 seconds
setTimeout(() => {
    console.log('\n❌ [FAILURE] Timeout waiting for AI response');
    process.exit(1);
}, 35000);
