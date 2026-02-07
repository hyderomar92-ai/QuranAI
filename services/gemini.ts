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
    tafsirInsights: {
      type: Type.ARRAY,
      description: "2-3 key scholarly interpretations from classical tafsir (e.g., Ibn Kathir, Al-Jalalayn).",
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
      description: "Related verses or Hadith.",
      items: {
        type: Type.OBJECT,
        properties: {
          source: { type: Type.STRING, description: "Citation (e.g., Sahih Bukhari 1:1)." },
          text: { type: Type.STRING, description: "The text of the related verse or hadith." },
          explanation: { type: Type.STRING, description: "How it relates to the current verse." }
        },
        required: ["source", "text", "explanation"]
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
  required: ["simpleMeaning", "tafsirInsights", "wordAnalysis", "moralTeachings", "connections", "reflectionQuestion", "quizQuestions"]
};

export const fetchVerseAnalysis = async (verse: Verse): Promise<VerseAnalysis> => {
  try {
    const prompt = `
      Analyze Surah Al-Fatiha, Verse ${verse.number}.
      Verse Text: "${verse.translation}"
      Arabic: "${verse.arabic}"

      Provide a comprehensive study guide for a non-Arabic speaking student.
      Include:
      1. A very simple, plain English meaning.
      2. Insights from classical Tafsir (Ibn Kathir, Al-Jalalayn, Al-Qurtubi).
      3. Word-by-word linguistic breakdown (roots).
      4. Context of revelation (Meccan/Medinan, specific incidents).
      5. Moral teachings and action points.
      6. Connections to other parts of Quran or Hadith.
      7. A reflective question for the user.
      8. 3 Quiz questions to test understanding of the analysis.
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
          You are currently discussing Surah Al-Fatiha, Verse ${verse.number}: "${verse.translation}".
          Arabic: "${verse.arabic}".

          Answer the user's questions based on classical Tafsir (Ibn Kathir, Jalalayn, etc.) and authentic Hadith.
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
