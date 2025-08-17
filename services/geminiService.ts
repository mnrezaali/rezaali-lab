import { GoogleGenerativeAI } from '@google/generative-ai';
import { PresentationContext, AnalysisReport } from '../types.ts';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const responseSchema = {
  type: "object",
  properties: {
    overallScore: {
      type: "number",
      description: "Overall presentation score from 1-10"
    },
    fillerWordAnalysis: {
      type: "object",
      properties: {
        score: { type: "number" },
        feedback: { type: "string" },
        density: { type: "number" },
        count: { type: "number" },
        flaggedSections: {
          type: "array",
          items: { type: "string" }
        }
      },
      required: ["score", "feedback", "density", "count", "flaggedSections"]
    },
    clarityConciseness: {
      type: "object",
      properties: {
        score: { type: "number" },
        feedback: { type: "string" },
        wordiness: { type: "number" },
        jargonLevel: { type: "number" },
        suggestions: {
          type: "array",
          items: { type: "string" }
        }
      },
      required: ["score", "feedback", "wordiness", "jargonLevel", "suggestions"]
    },
    structuralFlow: {
      type: "object",
      properties: {
        score: { type: "number" },
        feedback: { type: "string" },
        transitionQuality: { type: "number" },
        logicalProgression: { type: "number" },
        weakPoints: {
          type: "array",
          items: { type: "string" }
        }
      },
      required: ["score", "feedback", "transitionQuality", "logicalProgression", "weakPoints"]
    },
    engagementImpact: {
      type: "object",
      properties: {
        score: { type: "number" },
        feedback: { type: "string" },
        emotionalResonance: { type: "number" },
        callToActionStrength: { type: "number" },
        memorability: { type: "number" }
      },
      required: ["score", "feedback", "emotionalResonance", "callToActionStrength", "memorability"]
    },
    visualFlow: {
      type: "array",
      items: {
        type: "object",
        properties: {
          section: { type: "string" },
          rating: { 
            type: "string",
            enum: ["good", "average", "poor"]
          },
          description: { type: "string" }
        },
        required: ["section", "rating", "description"]
      }
    }
  },
  required: ["overallScore", "fillerWordAnalysis", "clarityConciseness", "structuralFlow", "engagementImpact", "visualFlow"]
};

export async function analyzePresentation(
  context: PresentationContext, 
  transcript: string
): Promise<AnalysisReport> {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    });

    const prompt = `
You are an expert presentation coach with years of experience helping speakers improve their delivery and impact. 

Please analyze the following presentation transcript and provide detailed, actionable feedback tailored to the specific context provided.

PRESENTATION CONTEXT:
- Title: ${context.title}
- Purpose: ${context.purpose}
- Target Audience: ${context.audience}
${context.comments ? `- Additional Comments: ${context.comments}` : ''}

TRANSCRIPT TO ANALYZE:
${transcript}

Please provide a comprehensive analysis covering:

1. FILLER WORD ANALYSIS: Identify excessive use of "um", "uh", "like", "you know", etc. Calculate density per 100 words and flag specific problematic sections.

2. CLARITY & CONCISENESS: Evaluate how clear and concise the message is. Look for unnecessary wordiness, jargon that might confuse the audience, and opportunities to simplify complex ideas.

3. STRUCTURAL FLOW: Assess the logical progression of ideas, quality of transitions between points, and overall organization. Identify weak structural points.

4. ENGAGEMENT & IMPACT: Evaluate emotional resonance with the audience, strength of call-to-action, and overall memorability of the message.

5. VISUAL FLOW: Break down the presentation into logical sections (Introduction, Main Points, Conclusion, etc.) and rate each section as 'good', 'average', or 'poor' with specific descriptions.

Consider the stated purpose and target audience when providing feedback. Make all suggestions specific and actionable. Scores should be on a 1-10 scale where 10 is excellent and 1 is poor.

The overall score should reflect the presentation's effectiveness for its stated purpose and audience.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    return JSON.parse(text) as AnalysisReport;
  } catch (error) {
    console.error('Error analyzing presentation:', error);
    throw new Error('Failed to analyze presentation. Please try again.');
  }
}
