
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { SongData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSongLyrics = async (query: string): Promise<SongData> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are a Karaoke machine. Extract the lyrics and rhythm timing for the song: "${query}". 
    Create a fun Karaoke sequence for a 30-45 second game snippet. 
    I need a JSON object containing title, artist, and an array of 'lyrics' objects.
    Each lyric object should have 'word' (single word or short phrase), 'startTime' (float in seconds from song start), and 'duration' (float).
    Space the lyrics out reasonably and ensure the timing is consistent and slow. 
    Return only valid JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          artist: { type: Type.STRING },
          lyrics: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING },
                startTime: { type: Type.NUMBER },
                duration: { type: Type.NUMBER }
              },
              required: ['word', 'startTime', 'duration']
            }
          }
        },
        required: ['title', 'artist', 'lyrics']
      }
    }
  });

  const text = response.text.trim();
  try {
    return JSON.parse(text) as SongData;
  } catch (error) {
    console.error("Failed to parse Gemini response:", text);
    throw new Error("Failed to load song data. Please try another song!");
  }
};

export const generateSongAudio = async (lyrics: string, voiceName: string = 'Kore'): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Sing this VERY SLOWLY, with deep emotion and distinct pauses between words for a karaoke session: ${lyrics}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("Could not generate audio");
  return base64Audio;
};
