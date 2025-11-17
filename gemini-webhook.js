const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// Smart Switch App Knowledge Base
const APP_KNOWLEDGE = `
Smart Switch Data Transfer App Features:

1. QUICK TRANSFER:
   - Android to Android Transfer
   - Android to iOS / iOS to Android Transfer  
   - Send Process: Select categories (Images/Videos/Audio/Files) → Click Done → Click Send → Generate QR Code or PIN Code
   - Receive Process: Open Receive → Scan QR or Enter PIN → Download within 24 hours

2. WIFI TRANSFER:
   - Same WiFi network or Hotspot connection
   - Direct device-to-device transfer
   - No time limits

3. ANDROID TO PC:
   - Generate IP address with port (e.g., 192.168.1.5:8080)
   - Enter in PC browser to download files
   - No software installation needed

IMPORTANT: Quick Transfer data automatically deletes after 24 hours for security.
`;

// Gemini API function
async function callGeminiAPI(userQuery) {
    // Use environment variable for security
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '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';
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
    
    const prompt = `
    You are an expert assistant for "Smart Switch Data Transfer" mobile app.

    APP KNOWLEDGE:
    ${APP_KNOWLEDGE}

    USER QUESTION: "${userQuery}"

    INSTRUCTIONS:
    - Provide CLEAR, STEP-BY-STEP instructions
    - Use SIMPLE language with emojis if helpful  
    - Focus on PRACTICAL steps user can follow
    - If question is unclear, ask for clarification
    - If unrelated, politely redirect to app features

    Respond in a helpful, friendly manner. Be specific and actionable.
    `;
    
    const requestData = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }]
    };

    try {
        console.log('Calling Gemini API for query:', userQuery);
        const response = await axios.post(url, requestData, {
            timeout: 15000
        });
        
        if (response.data.candidates && response.data.candidates[0].content.parts[0].text) {
            return response.data.candidates[0].content.parts[0].text;
        } else {
            return "I'm here to help with Smart Switch Data Transfer! I can assist with Quick Transfer, WiFi Transfer, or Android to PC transfer. What do you need help with?";
        }
    } catch (error) {
        console.error('Gemini API Error:', error.response?.data || error.message);
        return "I specialize in Smart Switch Data Transfer app. I can help you with:\n\n🚀 Quick Transfer (Android/iPhone)\n📶 WiFi Transfer (Same network)\n💻 Android to PC Transfer\n\nWhat would you like to know?";
    }
}

// Dialogflow Webhook
app.post('/webhook', async (req, res) => {
    console.log('🔄 Dialogflow Webhook Called');
    
    const userQuery = req.body.queryResult?.queryText || "Hello";
    const intentName = req.body.queryResult?.intent?.displayName || "Unknown Intent";
    
    console.log('User Query:', userQuery);
    console.log('Intent Name:', intentName);
    
    try {
        const geminiResponse = await callGeminiAPI(userQuery);
        console.log('Gemini Response Length:', geminiResponse.length);
        
        const response = {
            fulfillmentText: geminiResponse,
            fulfillmentMessages: [
                {
                    text: {
                        text: [geminiResponse]
                    }
                }
            ],
            source: "smart-switch-gemini-webhook"
        };
        
        res.json(response);
        
    } catch (error) {
        console.error('Webhook Error:', error);
        res.json({
            fulfillmentText: "I'm here to help with Smart Switch Data Transfer! I can assist with:\n\n• Quick Transfer between phones\n• WiFi Transfer on same network\n• Android to PC file transfer\n\nWhat would you like to know?",
        });
    }
});

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ 
        status: '✅ RUNNING',
        service: 'Smart Switch Dialogflow Webhook',
        timestamp: new Date().toISOString(),
        endpoints: {
            webhook: 'POST /webhook',
            health: 'GET /',
            test: 'GET /test'
        }
    });
});

// Test endpoint
app.get('/test', async (req, res) => {
    const testQuery = "how to transfer photos from android to iphone?";
    try {
        const response = await callGeminiAPI(testQuery);
        res.json({ 
            status: 'TEST SUCCESSFUL',
            question: testQuery,
            answer: response 
        });
    } catch (error) {
        res.json({ 
            status: 'TEST FAILED',
            error: error.message 
        });
    }
});

// Keep alive endpoint for free tier
app.get('/keep-alive', (req, res) => {
    res.json({ 
        message: 'Server is awake!',
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Smart Switch Webhook Server running on port ${PORT}`);
    console.log(`📍 Health: http://localhost:${PORT}/`);
    console.log(`📍 Test: http://localhost:${PORT}/test`);
});
