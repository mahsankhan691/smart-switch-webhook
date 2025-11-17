const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// Smart Switch App Knowledge Base
const APP_KNOWLEDGE = `
Smart Switch Data Transfer App - Complete Guide:

MAIN FEATURES:
1. QUICK TRANSFER (Cloud-based):
   - Android to Android Transfer
   - Android to iOS / iOS to Android Transfer
   - Send Process: Select Data Categories (Images/Videos/Audio/Files/Contacts) → Click Done → Click Send → Generate QR Code or PIN Code → Share with Receiver
   - Receive Process: Open Receive → Scan QR or Enter PIN → Download within 24 hours
   - Time Limit: 24 hours auto-delete

2. WIFI TRANSFER (Local):
   - Same WiFi network or Hotspot connection
   - Direct device-to-device transfer
   - No time limits, faster transfer

3. ANDROID TO PC:
   - Generate IP address with port (e.g., 192.168.1.5:8080)
   - Enter in PC browser to download files
   - No software installation needed

SECURITY: Encrypted transfer, auto-delete after 24 hours (Quick Transfer)
`;

// Enhanced AI Function with Fallback
async function callAI(userQuery) {
    const GROQ_API_KEY = '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';
    
    try {
        console.log('🤖 Calling Groq API...');
        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: "llama3-8b-8192", // Using 8B model for reliability
                messages: [
                    {
                        role: "system",
                        content: `You are a helpful assistant for Smart Switch Data Transfer app. ${APP_KNOWLEDGE}`
                    },
                    {
                        role: "user", 
                        content: `User question: "${userQuery}". Provide clear, step-by-step instructions.`
                    }
                ],
                temperature: 0.7,
                max_tokens: 800
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
        console.error('❌ API Error:', error.response?.data || error.message);
        return null; // Return null to trigger fallback
    }
}

// Smart Fallback Responses
function getFallbackResponse(userQuery) {
    const query = userQuery.toLowerCase();
    
    if (query.includes('android') && query.includes('iphone')) {
        return `📱 **Transfer Photos from Android to iPhone:**

🚀 **QUICK TRANSFER METHOD:**
1. On Android: Open Quick Transfer → Select "Send Data"
2. Choose "Images" category → Select photos → Click "Done"
3. Click "Send" → Generate QR Code or PIN Code
4. On iPhone: Open Quick Transfer → Select "Receive Data" 
5. Scan QR Code or Enter PIN Code → Download within 24 hours

⚡ **WiFi TRANSFER METHOD:**
1. Connect both phones to same WiFi network
2. On Android: WiFi Transfer → Send → Select photos
3. On iPhone: WiFi Transfer → Receive → Download
4. No time limits, direct transfer

🔒 **Note:** Quick Transfer data auto-deletes after 24 hours for security.`;
    }
    
    if (query.includes('send') || query.includes('transfer')) {
        return `📤 **Send Data Methods:**

🚀 Quick Transfer - Cloud based (24h limit)
📶 WiFi Transfer - Same network (No limits)  
💻 Android to PC - Browser download

Which method do you want to use?`;
    }
    
    if (query.includes('receive') || query.includes('get data')) {
        return `📥 **Receive Data Methods:**

🔗 Quick Transfer - Scan QR or Enter PIN
📶 WiFi Transfer - Auto-detect on same network
💻 Android to PC - Enter IP in browser

How did the sender send the data?`;
    }
    
    return `🤖 **Smart Switch Data Transfer Assistant**

I can help you with:

🚀 **Quick Transfer** - Phone to phone transfer (24h limit)
📶 **WiFi Transfer** - Same network transfer (No limits)
💻 **Android to PC** - Computer transfer

What would you like to do today?`;
}

// Dialogflow Webhook
app.post('/webhook', async (req, res) => {
    console.log('🔄 Webhook Called');
    
    const userQuery = req.body.queryResult?.queryText || "Hello";
    console.log('User Query:', userQuery);
    
    try {
        // Try AI first
        let aiResponse = await callAI(userQuery);
        
        // If AI fails, use smart fallback
        if (!aiResponse) {
            console.log('🔄 Using fallback response');
            aiResponse = getFallbackResponse(userQuery);
        }
        
        const response = {
            fulfillmentText: aiResponse,
            fulfillmentMessages: [
                {
                    text: {
                        text: [aiResponse]
                    }
                }
            ]
        };
        
        console.log('✅ Response ready');
        res.json(response);
        
    } catch (error) {
        console.error('❌ Final error:', error);
        res.json({
            fulfillmentText: getFallbackResponse(userQuery)
        });
    }
});

// Health check
app.get('/', (req, res) => {
    res.json({ 
        status: '✅ RUNNING',
        service: 'Smart Switch Webhook - Enhanced',
        timestamp: new Date().toISOString()
    });
});

// Test endpoint with guaranteed response
app.get('/test', (req, res) => {
    const testResponse = `🚀 **Transfer Photos from Android to iPhone:**

**QUICK TRANSFER:**
1. On Android: Quick Transfer → Send Data → Images → Select photos → Done → Send
2. Generate QR Code or PIN Code
3. On iPhone: Quick Transfer → Receive Data → Scan QR/Enter PIN
4. Download within 24 hours

**WiFi TRANSFER:**
1. Connect to same WiFi
2. Direct transfer, no time limits

Ready to help! 🎯`;

    res.json({ 
        status: 'TEST SUCCESS',
        question: "how to transfer photos from android to iphone?",
        answer: testResponse
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('🚀 Enhanced Smart Switch Webhook Running on port', PORT);
});
