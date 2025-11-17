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
   - Send Process: Select categories → Click Done → Click Send → Generate QR/PIN
   - Receive Process: Scan QR or Enter PIN → Download within 24 hours

2. WIFI TRANSFER:
   - Same WiFi network or Hotspot
   - Direct device-to-device transfer
   - No time limits

3. ANDROID TO PC:
   - Generate IP address with port
   - Enter in PC browser to download

TIME LIMITS: Quick Transfer = 24 hours, Others = No limits
SECURITY: Encrypted transfer, auto-delete, one-time codes
`;

// Gemini API function
async function callGeminiAPI(userQuery) {
    const GEMINI_API_KEY = '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';
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
    
    const prompt = `
    You are a helpful assistant for "Smart Switch Data Transfer" mobile app.

    APP KNOWLEDGE:
    ${APP_KNOWLEDGE}

    USER QUESTION: "${userQuery}"

    INSTRUCTIONS:
    - Provide CLEAR, STEP-BY-STEP instructions
    - Use SIMPLE language with emojis if helpful  
    - Focus on PRACTICAL steps user can follow
    - If question is unclear, ask for clarification
    - If unrelated, politely redirect to app features

    Respond in a helpful, friendly manner:
    `;
    
    const requestData = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }]
    };

    try {
        console.log('Calling Gemini API...');
        const response = await axios.post(url, requestData, {
            timeout: 10000
        });
        
        if (response.data.candidates && response.data.candidates[0].content.parts[0].text) {
            return response.data.candidates[0].content.parts[0].text;
        } else {
            return "I'm currently learning to handle more queries. Please try again later.";
        }
    } catch (error) {
        console.error('Gemini API Error:', error.response?.data || error.message);
        return "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.";
    }
}

// Dialogflow Webhook
app.post('/webhook', async (req, res) => {
    console.log('=== DIALOGFLOW WEBHOOK CALLED ===');
    console.log('Full Request Body:', JSON.stringify(req.body, null, 2));
    
    const userQuery = req.body.queryResult?.queryText || "Hello";
    const intentName = req.body.queryResult?.intent?.displayName || "Unknown Intent";
    
    console.log('User Query:', userQuery);
    console.log('Intent Name:', intentName);
    
    try {
        const geminiResponse = await callGeminiAPI(userQuery);
        console.log('Gemini Response:', geminiResponse);
        
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
        
        console.log('Sending response to Dialogflow...');
        res.json(response);
        
    } catch (error) {
        console.error('Webhook Error:', error);
        res.json({
            fulfillmentText: "I'm currently experiencing technical difficulties. Please try asking about Quick Transfer, WiFi Transfer, or Android to PC transfer.",
        });
    }
});

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ 
        status: 'OK',
        message: 'Smart Switch Dialogflow Webhook is running!',
        timestamp: new Date().toISOString()
    });
});

// Test endpoint
app.get('/test', async (req, res) => {
    const testQuery = "how to transfer photos from android to iphone?";
    const response = await callGeminiAPI(testQuery);
    res.json({ question: testQuery, answer: response });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Smart Switch Webhook Server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/`);
    console.log(`📍 Test endpoint: http://localhost:${PORT}/test`);
});
