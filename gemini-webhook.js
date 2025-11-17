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
   - Process: Auto-detection, direct file transfer

3. ANDROID TO PC:
   - Generate IP address with port (e.g., 192.168.1.5:8080)
   - Enter in PC browser to download files
   - No software installation needed

FILE TYPES SUPPORTED:
- Images (Photos, Screenshots)
- Videos (Movies, Clips)
- Audio (Music, Recordings)
- Files (Documents, PDFs, APKs)
- Contacts

SECURITY FEATURES:
- End-to-end encryption
- Auto-delete after 24 hours (Quick Transfer)
- One-time use QR/PIN codes
- Secure cloud storage
`;

// Groq AI API Function with Llama 3.3
async function callGroqAI(userQuery) {
    // YOUR GROQ API KEY
    const GROQ_API_KEY = process.env.GROQ_API_KEY || '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';
    const url = 'https://api.groq.com/openai/v1/chat/completions';
    
    const prompt = `
    You are an expert support assistant for "Smart Switch Data Transfer" mobile app.

    APP KNOWLEDGE BASE:
    ${APP_KNOWLEDGE}

    USER'S QUESTION: "${userQuery}"

    CRITICAL RESPONSE GUIDELINES:
    1. Provide CLEAR, STEP-BY-STEP instructions with exact button clicks
    2. Use SIMPLE English with helpful emojis for better readability
    3. Focus on PRACTICAL, ACTIONABLE steps user can follow immediately
    4. Always mention time limits (24 hours for Quick Transfer)
    5. Specify exact file types and categories available
    6. If question is unclear, ask for clarification about which transfer method
    7. If unrelated, politely redirect to Quick Transfer, WiFi Transfer, or Android to PC features

    FORMAT REQUIREMENTS:
    - Use bullet points or numbered steps
    - Include relevant emojis for visual appeal
    - Be specific about button names: "Done", "Send", "Receive", "Scan QR", "Enter PIN"
    - Mention device types: Android, iPhone, PC

    Always be extremely helpful, friendly, and specific about the Smart Switch app features.
    `;

    const requestData = {
        model: "llama-3.3-70b-versatile", // UPDATED TO LLAMA 3.3
        messages: [
            {
                role: "system",
                content: "You are a highly knowledgeable and helpful assistant for Smart Switch Data Transfer app. Provide clear, detailed, step-by-step guidance with exact button names and processes."
            },
            {
                role: "user",
                content: prompt
            }
        ],
        temperature: 0.7,
        max_tokens: 1200, // Slightly increased for better responses
        stream: false
    };

    try {
        console.log('🤖 Calling Groq AI with Llama 3.3...');
        const response = await axios.post(url, requestData, {
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 25000
        });
        
        if (response.data.choices && response.data.choices[0].message) {
            console.log('✅ Llama 3.3 Response Received');
            return response.data.choices[0].message.content;
        } else {
            throw new Error('Invalid response from Groq AI');
        }
    } catch (error) {
        console.error('❌ Groq AI Error:', error.response?.data || error.message);
        
        // Enhanced Smart Fallback based on question type
        if (userQuery.toLowerCase().includes('android') && userQuery.toLowerCase().includes('iphone')) {
            return `📱 **Transfer between Android and iPhone:**

🚀 **QUICK TRANSFER METHOD:**
1. On Android: Open Quick Transfer → Select "Send Data"
2. Choose file categories: Images, Videos, Audio, Files
3. Select files → Click "Done" → Click "Send"
4. Generate QR Code or PIN Code
5. On iPhone: Open Quick Transfer → Select "Receive Data"
6. Scan QR Code or Enter PIN Code
7. Download files within 24 hours

⚡ **WiFi TRANSFER METHOD:**
1. Connect both phones to same WiFi network
2. On Android: WiFi Transfer → Send → Select files
3. On iPhone: WiFi Transfer → Receive → Download
4. No time limits, direct transfer

🔒 **Security Note:** Quick Transfer data auto-deletes after 24 hours for privacy.

Which transfer method would you like to use?`;
        }
        
        if (userQuery.toLowerCase().includes('send') || userQuery.toLowerCase().includes('transfer')) {
            return `📤 **Send Data Methods Available:**

🚀 **QUICK TRANSFER SEND:**
• Cloud-based transfer
• Generate QR/PIN codes
• Receiver has 24 hours to download
• Perfect for phone-to-phone transfer

📶 **WiFi TRANSFER SEND:**
• Same network transfer
• Direct device-to-device
• No time limits
• Faster for large files

💻 **ANDROID TO PC SEND:**
• Generate IP address
• PC downloads via browser
• No software needed

Which send method would you like to use?`;
        }
        
        return `🤖 **Smart Switch Data Transfer Assistant**

I specialize in helping you transfer data between devices! 

📱 **MAIN FEATURES:**
🚀 Quick Transfer (Android/iPhone) - 24h limit
📶 WiFi Transfer (Same network) - No limits  
💻 Android to PC (Browser download) - Direct

What would you like to do today?`;
    }
}

// Dialogflow Webhook
app.post('/webhook', async (req, res) => {
    console.log('🔄 DIALOGFLOW WEBHOOK CALLED - Llama 3.3');
    
    const userQuery = req.body.queryResult?.queryText || "Hello";
    const intentName = req.body.queryResult?.intent?.displayName || "Unknown";
    
    console.log('📝 User Query:', userQuery);
    console.log('🎯 Intent:', intentName);
    
    try {
        const aiResponse = await callGroqAI(userQuery);
        console.log('✅ Llama 3.3 Response Generated');
        
        const response = {
            fulfillmentText: aiResponse,
            fulfillmentMessages: [
                {
                    text: {
                        text: [aiResponse]
                    }
                }
            ],
            source: "smart-switch-llama3.3-webhook"
        };
        
        console.log('📤 Sending response to Dialogflow...');
        res.json(response);
        
    } catch (error) {
        console.error('❌ Webhook Error:', error);
        
        const fallbackResponse = {
            fulfillmentText: `🤖 **Smart Switch Assistant** 

I can help you with data transfer between devices:

🚀 **Quick Transfer** - Phone to phone (24h limit)
📶 **WiFi Transfer** - Same network (No limits)  
💻 **Android to PC** - Browser download

What specific transfer do you need help with?`
        };
        
        res.json(fallbackResponse);
    }
});

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ 
        status: '✅ RUNNING',
        service: 'Smart Switch AI Webhook - Llama 3.3',
        model: 'llama-3.3-70b-versatile',
        timestamp: new Date().toISOString(),
        endpoints: {
            webhook: 'POST /webhook',
            health: 'GET /',
            test: 'GET /test',
            keepalive: 'GET /keepalive'
        }
    });
});

// Enhanced Test endpoint
app.get('/test', async (req, res) => {
    const testQuestions = [
        "how to transfer photos from android to iphone?",
        "what is the difference between quick transfer and wifi transfer?",
        "how to send files to my computer?",
        "someone sent me data, how do i receive it?",
        "is my data secure during transfer?"
    ];
    
    const randomQuestion = testQuestions[Math.floor(Math.random() * testQuestions.length)];
    
    try {
        const response = await callGroqAI(randomQuestion);
        res.json({ 
            status: 'TEST SUCCESSFUL 🎉',
            model: 'llama-3.3-70b-versatile',
            question: randomQuestion,
            answer: response,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.json({ 
            status: 'TEST FAILED ❌',
            model: 'llama-3.3-70b-versatile',
            question: randomQuestion,
            error: error.message
        });
    }
});

// Keep alive for free tier
app.get('/keepalive', (req, res) => {
    res.json({ 
        message: '🚀 Server is awake and ready!',
        model: 'llama-3.3-70b-versatile',
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('🚀 Smart Switch AI Webhook Server Started!');
    console.log('🤖 Using: Llama 3.3 70B Versatile');
    console.log('📍 Port:', PORT);
    console.log('📍 Health Check: http://localhost:' + PORT + '/');
    console.log('📍 Test Endpoint: http://localhost:' + PORT + '/test');
    console.log('📍 Webhook: http://localhost:' + PORT + '/webhook');
    console.log('⏰ Server time:', new Date().toISOString());
});
