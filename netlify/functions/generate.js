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

const ANALYSIS_PROMPT = `You are an expert presentation coach and communication analyst. Your task is to analyze a presentation transcript and provide detailed, actionable feedback.

Analyze the following presentation based on these criteria:
1. **Clarity & Structure**: How well-organized and clear is the content?
2. **Engagement**: How engaging and compelling is the delivery?
3. **Content Quality**: How valuable and relevant is the information?
4. **Delivery Style**: How effective is the speaking style and flow?
5. **Audience Connection**: How well does it connect with the target audience?

CRITICAL: Respond with ONLY the JSON object below. No markdown, no code blocks, no backticks, no explanatory text. Start your response with { and end with }:
{
  "overallScore": 8,
  "clarity": {
    "score": 7,
    "feedback": "Clear main points but could improve transitions"
  },
  "engagement": {
    "score": 8,
    "feedback": "Good use of examples and storytelling"
  },
  "content": {
    "score": 9,
    "feedback": "Highly relevant and valuable information"
  },
  "delivery": {
    "score": 7,
    "feedback": "Natural flow with some filler words"
  },
  "audience": {
    "score": 8,
    "feedback": "Well-tailored to the target audience"
  },
  "summary": "Brief executive summary of the presentation analysis",
  "strengths": [
    "Key strength 1",
    "Key strength 2",
    "Key strength 3"
  ],
  "improvements": [
    "Specific improvement suggestion 1",
    "Specific improvement suggestion 2",
    "Specific improvement suggestion 3"
  ],
  "recommendations": [
    "Actionable recommendation 1",
    "Actionable recommendation 2"
  ]
}`;

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
    const { type, purpose, tone, audience, chatHistory, context, transcript } = JSON.parse(event.body);

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
    } else if (type === 'analyze') {
      // Presentation analysis
      const contextInfo = `
**Presentation Context:**
- Title: ${context.title}
- Purpose: ${context.purpose}
- Target Audience: ${context.audience}

**Transcript to Analyze:**
${transcript}`;
      prompt = `${ANALYSIS_PROMPT}\n\n${contextInfo}`;
    } else {
      throw new Error('Invalid request type');
    }

    // Generate response
    const result = await model.generateContent(prompt);
    const response = result.response;
    let text = response.text();
    
    // Clean up markdown formatting for JSON responses
    if (type === 'analyze') {
      // More aggressive cleaning for markdown formatting
      text = text
        .replace(/```json/gi, '')  // Remove ```json (case insensitive)
        .replace(/```/g, '')       // Remove any remaining ```
        .replace(/`/g, '')         // Remove any backticks
        .trim();                   // Remove whitespace
      
      // Extract JSON object only
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        text = text.substring(jsonStart, jsonEnd + 1);
      }
      
      // Validate JSON before sending
      try {
        JSON.parse(text);
      } catch (e) {
        console.error('Invalid JSON generated:', text);
        throw new Error('Generated response is not valid JSON');
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        text: text,
        success: true 
      })
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
