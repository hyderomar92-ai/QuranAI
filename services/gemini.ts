import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Verse, VerseAnalysis } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Use Gemini 3 Flash Preview as recommended for basic text tasks
const ANALYSIS_MODEL = 'gemini-3-flash-preview'; 
const CHAT_MODEL = 'gemini-3-flash-preview';

// Schema for structured verse analysis
const verseAnalysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    simpleMeaning: { type: Type.STRING, description: "A simple, accessible explanation of the verse for a beginner." },
    topics: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3-5 key themes or concepts in this verse (e.g. 'Mercy', 'Day of Judgment', 'Guidance')."
    },
    tafsirInsights: {
      type: Type.ARRAY,
      description: "4-5 key scholarly interpretations from major classical tafsirs (Ibn Kathir, Al-Jalalayn, Al-Tabari, Al-Qurtubi, As-Sa'di).",
      items: {
        type: Type.OBJECT,
        properties: {
          scholar: { type: Type.STRING, description: "Name of the scholar or Tafsir book." },
          insight: { type: Type.STRING, description: "The specific interpretation or point made." }
        },
        required: ["scholar", "insight"]
      }
    },
    wordAnalysis: {
      type: Type.ARRAY,
      description: "Breakdown of key Arabic words in the verse.",
      items: {
        type: Type.OBJECT,
        properties: {
          arabicWord: { type: Type.STRING },
          root: { type: Type.STRING, description: "The 3-letter root." },
          meaning: { type: Type.STRING, description: "Literal meaning." },
          nuance: { type: Type.STRING, description: "Linguistic nuance or depth." }
        },
        required: ["arabicWord", "root", "meaning", "nuance"]
      }
    },
    historicalContext: { type: Type.STRING, description: "When and why this verse was revealed (Asbab al-Nuzul) if applicable." },
    moralTeachings: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Practical moral lessons derived from the verse."
    },
    connections: {
      type: Type.ARRAY,
      description: "Categorized connections to other verses, hadith, history, or geography.",
      items: {
        type: Type.OBJECT,
        properties: {
          type: { 
            type: Type.STRING, 
            enum: ['quran', 'hadith', 'history', 'geography', 'general'],
            description: "The category of this connection." 
          },
          source: { type: Type.STRING, description: "Citation (e.g., 'Quran 2:152', 'Sahih Bukhari 50', 'Battle of Badr')." },
          text: { type: Type.STRING, description: "The text of the related verse, hadith, or historical event description." },
          explanation: { type: Type.STRING, description: "Why this is connected to the current verse." },
          url: { type: Type.STRING, description: "A direct URL to the source on quran.com, sunnah.com, or a map link if applicable." }
        },
        required: ["type", "source", "text", "explanation"]
      }
    },
    reflectionQuestion: {
      type: Type.STRING,
      description: "A deep, personal question for the user to reflect on based on the verse's meaning."
    },
    quizQuestions: {
      type: Type.ARRAY,
      description: "3 multiple choice questions to test the user's understanding of this specific verse analysis.",
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "4 possible answers" },
          correctAnswerIndex: { type: Type.INTEGER, description: "The index of the correct answer (0-3)" },
          explanation: { type: Type.STRING, description: "Brief explanation of why this answer is correct" }
        },
        required: ["question", "options", "correctAnswerIndex", "explanation"]
      }
    }
  },
  required: ["simpleMeaning", "topics", "tafsirInsights", "wordAnalysis", "moralTeachings", "connections", "reflectionQuestion", "quizQuestions"]
};

export const fetchVerseAnalysis = async (verse: Verse): Promise<VerseAnalysis> => {
  try {
    const prompt = `
      Analyze Surah ${verse.surah}, Verse ${verse.number}.
      Verse Text: "${verse.translation}"
      Arabic: "${verse.arabic}"

      Provide a comprehensive study guide for a non-Arabic speaking student.
      
      CRITICAL INSTRUCTION FOR CONNECTIONS:
      Provide diverse connections categorized by type:
      1. 'quran': Related verses (Tafsir of Quran by Quran) or thematic parallels.
      2. 'hadith': Relevant traditions explaining the verse.
      3. 'history': Timeline context (e.g., 'Revealed before migration') or events.
      4. 'geography': Specific places mentioned or relevant to the verse (e.g. Makkah, Badr).
      
      For 'quran' and 'hadith', try to generate valid URLs to quran.com or sunnah.com.
      
      Include:
      1. A very simple, plain English meaning.
      2. 3-5 One-word topics or concepts (e.g. Mercy, Monotheism).
      3. Insights from classical Tafsir. You MUST include at least 4-5 diverse perspectives including:
         - Tafsir Ibn Kathir (Report-based)
         - Tafsir Al-Jalalayn (Linguistic/Concise)
         - Tafsir Al-Tabari (Early analytical)
         - Tafsir Al-Qurtubi (Legal/Fiqh focus)
         - Tafsir As-Sa'di (Spiritual/Modern)
      4. Word-by-word linguistic breakdown.
      5. Context of revelation.
      6. Moral teachings.
      7. Categorized Connections.
      8. A reflective question.
      9. 3 Quiz questions.
    `;

    const response = await ai.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: verseAnalysisSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as VerseAnalysis;
  } catch (error) {
    console.error("Error fetching analysis:", error);
    throw error;
  }
};

export const chatWithVerse = async (
  verse: Verse,
  history: { role: 'user' | 'model'; text: string }[],
  question: string
): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: CHAT_MODEL,
      config: {
        systemInstruction: `
          You are a warm, knowledgeable Islamic scholar and Quran tutor.
          You are currently discussing Surah ${verse.surah}, Verse ${verse.number}: "${verse.translation}".
          Arabic: "${verse.arabic}".

          Answer the user's questions based on classical Tafsir (Ibn Kathir, Jalalayn, Tabari, Qurtubi, Sa'di) and authentic Hadith.
          Be concise but deep. Always cite your sources.
          If the user asks about Arabic words, explain the root and nuance.
          Maintain a spiritual and respectful tone.
        `
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const response = await chat.sendMessage({ message: question });
    return response.text || "I apologize, I could not generate an answer at this moment.";
  } catch (error) {
    console.error("Error in chat:", error);
    return "I am having trouble connecting to the knowledge base right now. Please try again.";
  }
};
