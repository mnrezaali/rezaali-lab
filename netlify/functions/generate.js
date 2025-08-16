const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const GENERATION_PROMPT = `You are a world-class expert in designing AI assistant prompts. Your task is to take a user's brief idea for an AI assistant and expand it into a comprehensive, well-structured, and effective system prompt. The prompt should be ready to be used directly with a large language model.

When generating the prompt, you must follow this structure and include these sections:

**Core Identity:**
- Persona: Define the AI's personality and communication style. Be specific.
- Primary Role: State the AI's main purpose in a single, clear sentence.

**Key Responsibilities & Capabilities:**
Use a bulleted list to detail the specific tasks the AI can perform.

**Rules & Constraints:**
Use a bulleted list to define clear boundaries.
Crucially, you must always include a disclaimer that the AI is not a substitute for a licensed professional (e.g., therapist, doctor, lawyer).

**Interaction Style:**
Describe how the AI should interact with the user.

**Example Opening:**
Provide a sample opening message that the AI could use to introduce itself.`;

const REFINEMENT_PROMPT = `You are a prompt editing assistant. Your role is to modify a prompt based on user instructions. When the user provides a command, you must rewrite and output the ENTIRE, new, updated prompt. Do not just describe the changes or provide a snippet. Output the complete, ready-to-use prompt.`;

exports.handler = async (event, context) => {
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { type, purpose, tone, audience, chatHistory } = JSON.parse(event.body);

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let prompt;
    
    if (type === 'generate') {
      // Initial prompt generation
      const userInput = `Purpose: ${purpose}\nTone: ${tone}${audience ? `\nTarget Audience: ${audience}` : ''}`;
      prompt = `${GENERATION_PROMPT}\n\nUser Input:\n${userInput}`;
    } else if (type === 'refine') {
      // Prompt refinement
      const messages = chatHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n\n');
      prompt = `${REFINEMENT_PROMPT}\n\nConversation History:\n${messages}`;
    } else {
      throw new Error('Invalid request type');
    }

    // Generate streaming response
    const result = await model.generateContentStream(prompt);

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    let responseText = '';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            responseText += chunkText;
            controller.enqueue(encoder.encode(chunkText));
          }
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      }
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain',
        'Transfer-Encoding': 'chunked'
      },
      body: stream,
      isBase64Encoded: false
    };

  } catch (error) {
    console.error('Function error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
};
