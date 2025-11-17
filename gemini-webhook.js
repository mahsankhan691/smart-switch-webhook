const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// Smart Switch Knowledge Base
const APP_KNOWLEDGE = `
Smart Switch Data Transfer App Features:

1. QUICK TRANSFER:
   - Android to Android, Android to iOS, iOS to Android
   - Send: Select files → Done → Send → Generate QR/PIN
   - Receive: Scan QR or Enter PIN → Download within 24h

2. WIFI TRANSFER:
   - Same WiFi/Hotspot, direct transfer, no time limits

3. ANDROID TO PC:
   - IP address browser download
`;

// Groq AI with Llama 3.3
async function callGroqAI(userQuery) {
    const GROQ_API_KEY = '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';
    
    try {
        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: "llama-3.3-70b-versatile", // LLAMA 3.3 MODEL
                messages: [
                    {
                        role: "system",
                        content: `You are a Smart Switch Data Transfer assistant. ${APP_KNOWLEDGE} Provide clear, step-by-step help.`
                    },
                    {
                        role: "user",
                        content: userQuery
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000
            },
            {
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 15000
            }
        );

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Groq API Error:', error.message);
        return null;
    }
}

// Fallback responses
function getFallbackResponse(userQuery) {
    const query = userQuery.toLowerCase();
    
    if (query.includes('android') && query.includes('iphone')) {
        return `📱 Transfer Android to iPhone:\n1. Use Quick Transfer\n2. Or WiFi Transfer\n3. Select files and share`;
    }
    
    return `Smart Switch Help: Quick Transfer, WiFi Transfer, Android to PC`;
}

// Webhook with Groq AI
app.post('/webhook', async (req, res) => {
    const userQuery = req.body.queryResult?.queryText || "Hello";
    
    try {
        // Try Groq AI first
        let responseText = await callGroqAI(userQuery);
        
        // If Groq fails, use fallback
        if (!responseText) {
            responseText = getFallbackResponse(userQuery);
        }
        
        res.json({
            fulfillmentText: responseText,
            source: "groq-llama3.3-webhook"
        });
        
    } catch (error) {
        res.json({
            fulfillmentText: getFallbackResponse(userQuery)
        });
    }
});

app.get('/', (req, res) => {
    res.json({ 
        status: 'RUNNING', 
        model: 'llama-3.3-70b-versatile',
        service: 'Groq AI Webhook'
    });
});

app.listen(3000, () => {
    console.log('🚀 Groq + Llama 3.3 Webhook Running');
});
