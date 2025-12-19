
export interface VoiceContext {
  intent: string;
  tone: string;
}

/**
 * Analyzes the transcribed text for basic intent and emotional context
 * to help guide the AI's empathetic response.
 */
export const analyzeVoiceToneAndIntent = (text: string): VoiceContext => {
  const lowerText = text.toLowerCase();
  
  let intent = "general conversation";
  let tone = "neutral";

  // Intent analysis
  if (lowerText.includes("breath") || lowerText.includes("relax") || lowerText.includes("calm")) {
    intent = "relaxation guidance";
  } else if (lowerText.includes("burnout") || lowerText.includes("tired") || lowerText.includes("exhausted") || lowerText.includes("stressed")) {
    intent = "burnout support";
  } else if (lowerText.includes("therapist") || lowerText.includes("doctor") || lowerText.includes("help")) {
    intent = "professional support search";
  } else if (lowerText.includes("thank") || lowerText.includes("appreciate")) {
    intent = "gratitude";
  }

  // Tone analysis
  if (lowerText.includes("sad") || lowerText.includes("depressed") || lowerText.includes("crying") || lowerText.includes("hurts")) {
    tone = "vulnerable/sad";
  } else if (lowerText.includes("anxious") || lowerText.includes("panic") || lowerText.includes("scared")) {
    tone = "anxious/fearful";
  } else if (lowerText.includes("happy") || lowerText.includes("good") || lowerText.includes("great") || lowerText.includes("excited")) {
    tone = "positive/uplifted";
  } else if (lowerText.includes("angry") || lowerText.includes("mad") || lowerText.includes("frustrated")) {
    tone = "frustrated/irritable";
  }

  return { intent, tone };
};

/**
 * Wraps the transcribed text with voice-specific context for Gemini
 */
export const wrapVoicePrompt = (text: string, context: VoiceContext): string => {
  return `[VOICE INPUT CONTEXT] 
Detected Intent: ${context.intent}
Detected Emotional Tone: ${context.tone}
Transcribed Text: "${text}"

Please respond with extra warmth and empathy, acknowledging the spoken nature of this message.`;
};
