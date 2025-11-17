const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// Free AI API (No key needed) - Hugging Face
async function callFreeAI(userQuery) {
    try {
        const response = await axios.post(
            'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large',
            {
                inputs: userQuery,
                parameters: {
                    max_length: 500,
                    temperature: 0.7
                }
            },
            {
                headers: {
                    'Authorization': 'Bearer hf_free_access', // Public access
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            }
        );
        
        if (response.data && response.data[0] && response.data[0].generated_text) {
            return response.data[0].generated_text;
        }
        return null;
    } catch (error) {
        console.log('Free AI API not available, using smart responses');
        return null;
    }
}

// Smart Switch Knowledge Base
const SMART_KNOWLEDGE = {
    quickTransfer: {
        send: `🚀 **QUICK TRANSFER SEND:**
1. Open Quick Transfer → Choose device type
2. Select "Send Data" → Choose file categories
3. Select files → Click "Done" → Click "Send"  
4. Generate QR Code or PIN Code
5. Share with receiver`,

        receive: `📥 **QUICK TRANSFER RECEIVE:**
1. Open Quick Transfer → Choose device type
2. Select "Receive Data" 
3. Scan QR Code OR Enter PIN Code
4. Download files within 24 hours`
    },

    wifiTransfer: {
        send: `📶 **WIFI TRANSFER SEND:**
1. Connect both devices to same WiFi
2. Open WiFi Transfer → Send Data
3. Select files → Send
4. Automatic connection`,

        receive: `📥 **WIFI TRANSFER RECEIVE:**
1. Connect to same WiFi as sender
2. Open WiFi Transfer → Receive Data
3. Auto-detect sender → Download files`
    },

    androidToPC: {
        send: `💻 **ANDROID TO PC SEND:**
1. Open Android to PC → Send Data
2. Select files → Send
3. Get IP Address (e.g., 192.168.1.5:8080)`,

        receive: `📥 **ANDROID TO PC RECEIVE:**
1. On PC browser, enter IP from phone
2. Download files directly
3. No software needed`
    }
};

// Smart Response Generator
function generateResponse(userQuery) {
    const query = userQuery.toLowerCase();
    
    if (query.includes('android') && query.includes('iphone')) {
        return `📱 **Transfer between Android and iPhone:**

${SMART_KNOWLEDGE.quickTransfer.send}

${SMART_KNOWLEDGE.quickTransfer.receive}

**OR**

${SMART_KNOWLEDGE.wifiTransfer.send}

${SMART_KNOWLEDGE.wifiTransfer.receive}

⚡ **Choose your preferred method!**`;
    }

    if (query.includes('send')) {
        return `📤 **Send Data Methods:**

${SMART_KNOWLEDGE.quickTransfer.send}

${SMART_KNOWLEDGE.wifiTransfer.send}

${SMART_KNOWLEDGE.androidToPC.send}

**Which method?**`;
    }

    if (query.includes('receive')) {
        return `📥 **Receive Data Methods:**

${SMART_KNOWLEDGE.quickTransfer.receive}

${SMART_KNOWLEDGE.wifiTransfer.receive}

${SMART_KNOWLEDGE.androidToPC.receive}

**How was data sent to you?**`;
    }

    return `🤖 **Smart Switch Assistant**

I can help with:
🚀 Quick Transfer (24h limit)
📶 WiFi Transfer (No limits)  
💻 Android to PC (Browser download)

**What do you need help with?**`;
}

// Webhook - PRIMARY: Free AI, FALLBACK: Smart Responses
app.post('/webhook', async (req, res) => {
    console.log('🔄 Webhook Called');
    
    const userQuery = req.body.queryResult?.queryText || "Hello";
    console.log('Query:', userQuery);
    
    try {
        // Try Free AI first
        let aiResponse = await callFreeAI(userQuery);
        
        // If AI fails or not suitable, use smart response
        if (!aiResponse || aiResponse.includes('apologize') || aiResponse.length < 10) {
            console.log('🔄 Using smart response generator');
            aiResponse = generateResponse(userQuery);
        }
        
        const response = {
            fulfillmentText: aiResponse,
            fulfillmentMessages: [
                {
                    text: {
                        text: [aiResponse]
                    }
                }
            ],
            source: "smart-switch-hybrid-webhook"
        };
        
        console.log('✅ Response ready');
        res.json(response);
        
    } catch (error) {
        console.error('Error:', error);
        res.json({
            fulfillmentText: generateResponse(userQuery)
        });
    }
});

// Health check
app.get('/', (req, res) => {
    res.json({ 
        status: '✅ RUNNING',
        service: 'Smart Switch Hybrid Webhook',
        mode: 'Free AI + Smart Responses',
        timestamp: new Date().toISOString()
    });
});

// Test endpoint - ALWAYS WORKS
app.get('/test', (req, res) => {
    const testResponse = generateResponse("how to transfer photos from android to iphone?");
    
    res.json({ 
        status: '✅ TEST SUCCESS',
        question: "how to transfer photos from android to iphone?",
        answer: testResponse
    });
});

// Test AI endpoint
app.get('/test-ai', async (req, res) => {
    try {
        const aiResponse = await callFreeAI("hello");
        res.json({ 
            ai_status: aiResponse ? 'WORKING' : 'NOT AVAILABLE',
            response: aiResponse || 'Using smart responses'
        });
    } catch (error) {
        res.json({ 
            ai_status: 'ERROR',
            message: 'Using reliable smart responses'
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('🚀 Smart Switch Hybrid Webhook Running');
    console.log('📍 Port:', PORT);
    console.log('✅ Free AI + Smart Fallback = ALWAYS WORKS');
});
