// Shared demo scenarios used across multiple pages
export const DEMO_SCENARIOS = [
    {
        id: 'hi',
        language: 'Hindi',
        state: 'Uttar Pradesh',
        activeCalls: '6.8M',
        accuracy: '99.4%',
        errorRate: '1.2%',
        compute: '5.4 TFlops',
        load: '82%',
        nodes: '52/52',
        labels: ['Lucknow', 'Kanpur', 'Varanasi', 'Agra'],
        query: 'कल का मौसम कैसा रहेगा?',
        translation: 'How will the weather be tomorrow?',
        response: 'नमस्ते! कल उत्तर भारत में मौसम साफ रहेगा और धूप खिली रहेगी।',
        color: 'primary'
    },
    {
        id: 'mr',
        language: 'Marathi',
        state: 'Maharashtra',
        activeCalls: '5.2M',
        accuracy: '98.5%',
        errorRate: '2.5%',
        compute: '4.2 TFlops',
        load: '72%',
        nodes: '45/45',
        labels: ['Mumbai', 'Pune', 'Nagpur', 'Nashik'],
        query: 'आजचे मार्केट भाव काय आहेत?',
        translation: "What are today's market prices?",
        response: 'नमस्कार! आज मुंबई बाजारत कांदा २५ रुपये आणि कापूस ६५०० रुपये आहे।',
        color: 'accent-teal'
    },
    {
        id: 'ta',
        language: 'Tamil',
        state: 'Tamil Nadu',
        activeCalls: '4.4M',
        accuracy: '99.2%',
        errorRate: '1.8%',
        compute: '3.8 TFlops',
        load: '65%',
        nodes: '32/32',
        labels: ['Chennai', 'Coimbatore', 'Madurai', 'Salem'],
        query: 'பயிர் நோய்கள் பற்றி சொல்லுங்கள்',
        translation: 'Tell me about crop diseases',
        response: 'வணக்கம்! பயிர் நோய்களைத் தவிர்க்க வேப்ப எண்ணெய் அல்லது இயற்கை உரங்களைப் பயன்படுத்தலாம்.',
        color: 'primary'
    }
];
