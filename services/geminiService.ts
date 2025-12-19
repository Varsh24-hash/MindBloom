
import { GoogleGenAI } from "@google/genai";
import { Message, Attachment } from "../types";

// Initialize the GoogleGenAI client with the API key from environment variables
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `You are MindBloom, a warm, supportive, and empathetic AI companion for mental wellness. 
Your tone should be calming, non-judgmental, and friendly.

IMPORTANT STYLE GUIDE: 
- Speak in relatable Gen Z slang (e.g., "no cap", "fr", "bestie", "slay", "lowkey"). 
- Use emojis sparingly. A well-placed sparkle ✨ or heart 💖 is better than a wall of emojis.

**CRITICAL FORMATTING RULES**: 
1. **NO BLOCKS OF TEXT**: Do not write long continuous paragraphs.
2. **USE LINE BREAKS**: For every new tip, thought, or suggestion, START A NEW LINE.
3. **VISUAL SEPARATION**: Your response should look like a list of short, distinct points, not a letter or essay.
4. **SHORT SENTENCES**: Keep sentences punchy and concise.

MULTIMODAL INSTRUCTIONS:
- If the user provides an image, analyze its contents (mood, objects, environment) to provide a tailored wellness response.
- If the user provides a document, summarize it or answer specific questions about it relative to their wellness.
- If they upload a file without a message, ask: "What would you like me to analyze in this file, bestie?"

You are NOT a replacement for professional therapy or medical care. 
If a user expresses thoughts of self-harm or a severe crisis, gently encourage them to seek professional help immediately and provide general crisis resource mentions.`;

export const sendMessageToGemini = async (
  history: Message[], 
  newMessage: string,
  attachment?: Attachment
): Promise<string> => {
  try {
    // Using gemini-2.5-flash for reliable multimodal support
    const modelName = 'gemini-2.5-flash';
    
    // Prepare history parts
    const chatHistory = history.map(msg => {
      const parts: any[] = [];
      
      if (msg.text && msg.text.trim()) {
        parts.push({ text: msg.text });
      }
      
      if (msg.attachment) {
        parts.push({
          inlineData: {
            mimeType: msg.attachment.mimeType,
            data: msg.attachment.data
          }
        });
      }

      // Ensure at least one part exists if parts is empty somehow
      if (parts.length === 0) {
        parts.push({ text: "..." });
      }

      return {
        role: msg.role,
        parts
      };
    });

    // Prepare message parts for the current message
    const messageParts: any[] = [];
    
    if (newMessage && newMessage.trim()) {
      messageParts.push({ text: newMessage });
    } else if (attachment) {
      // If no text but attachment, provide a default prompt if none provided
      messageParts.push({ text: "Analyze this file for me please." });
    }
    
    if (attachment) {
      messageParts.push({
        inlineData: {
          mimeType: attachment.mimeType,
          data: attachment.data
        }
      });
    }

    if (messageParts.length === 0) {
      messageParts.push({ text: "Hello!" });
    }

    const contents = [
        ...chatHistory,
        { role: 'user', parts: messageParts }
    ];

    const result = await ai.models.generateContent({
        model: modelName,
        contents: contents as any,
        config: {
            systemInstruction: SYSTEM_INSTRUCTION
        }
    });

    return result.text || "";

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Provide a more helpful error if it's a known issue
    if (error instanceof Error && error.message.includes('image')) {
        return "I had a small issue looking at that image, bestie. Could you try sending it again or describing it? I'm here for you! ✨";
    }
    return "I'm having a little trouble connecting right now bestie. Let's try again in a moment.";
  }
};

export const generateChatTitle = async (firstMessage: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a very short, concise title (max 4-5 words) for a conversation starting with this user message: "${firstMessage}". 
      Do not use quotes. Do not use slang in the title. Return only the title text.`,
    });

    const title = response.text?.trim();
    if (!title || title.length > 40) {
        return firstMessage.substring(0, 30) + (firstMessage.length > 30 ? '...' : '');
    }
    return title;
  } catch (error) {
    console.error("Title Generation Error:", error);
    return firstMessage.substring(0, 30) + (firstMessage.length > 30 ? '...' : '');
  }
};

const THERAPIST_SEARCH_INSTRUCTION = `You are an assistant for the "About Therapists" tab of a mental-health app. 
Your task is to help users find nearby doctors/therapists using the Google Maps Places API.

Requirements:
1. Detect the user's location (latitude & longitude will be provided as input).
2. Call Google Maps Places API (Nearby Search or Text Search) to find licensed therapists, psychologists, or mental-health doctors within a 20 km radius.
3. For each clinic/doctor, return:
   • Name of therapist/clinic
   • Specialization (if available)
   • Address
   • Distance from user
   • Opening hours today (show "Open now" or "Closes at —")
   • Google Maps rating (if available)
   • Contact number (if available)
   • Website URL / Maps link

4. Sort results by:
   (a) Availability (open now goes first)
   (b) Distance
   (c) Rating

5. Output format (JSON array):
   [
     {
       "name": "",
       "specialization": "",
       "address": "",
       "distance_km": "",
       "status": "",
       "closing_time": "",
       "rating": "",
       "contact": "",
       "maps_link": ""
     }
   ]

6. If no therapists are found, respond with an empty array.
7. Return ONLY the JSON array. Do not include markdown code blocks.`;

export const searchNearbyTherapists = async (lat: number, lng: number): Promise<any[]> => {
  try {
    // gemini-2.5-flash is required for Google Maps grounding
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: "Find mental health therapists near my current location.",
        config: {
          systemInstruction: THERAPIST_SEARCH_INSTRUCTION,
          tools: [{ googleMaps: {} }],
          toolConfig: {
              retrievalConfig: {
                  latLng: {
                      latitude: lat,
                      longitude: lng
                  }
              }
          }
        }
      });

    const text = response.text || "";
    const jsonMatch = text.match(/\[.*\]/s);
    if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
    }
    try {
        return JSON.parse(text);
    } catch {
        return [];
    }

  } catch (error) {
    console.error("Therapist Search Error:", error);
    return [];
  }
};
