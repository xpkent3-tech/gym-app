import { parseMealText, type FoodItem } from './nutrition';

const URL = process.env.EXPO_PUBLIC_FOOD_AI_URL;
const TOKEN = process.env.EXPO_PUBLIC_FOOD_AI_TOKEN;

export const foodAIEnabled = () => !!URL;

export interface Estimate {
  items: FoodItem[];
  confidence: 'low' | 'medium' | 'high';
  notes: string;
  /** Text items the offline parser could not match. */
  unmatched: string[];
  source: 'ai' | 'offline';
}

type ApiResponse = {
  items: { name: string; grams: number; kcal: number; protein_g: number; carbs_g: number; fat_g: number }[];
  confidence: 'low' | 'medium' | 'high';
  notes: string;
};

async function callAI(body: { imageBase64?: string; text?: string }): Promise<Estimate> {
  const res = await fetch(`${URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}) },
    body: JSON.stringify({ ...body, mediaType: 'image/jpeg' }),
  });
  if (!res.ok) throw new Error(res.status === 422 ? 'The AI declined to analyse this image.' : `AI service error (${res.status})`);
  const data = (await res.json()) as ApiResponse;
  return {
    items: data.items.map((i) => ({
      name: i.name,
      grams: Math.round(i.grams),
      kcal: Math.round(i.kcal),
      protein: i.protein_g,
      carbs: i.carbs_g,
      fat: i.fat_g,
    })),
    confidence: data.confidence,
    notes: data.notes,
    unmatched: [],
    source: 'ai',
  };
}

export function estimateOffline(text: string): Estimate {
  const parts = parseMealText(text);
  return {
    items: parts.flatMap((p) => (p.item ? [p.item] : [])),
    unmatched: parts.filter((p) => !p.item).map((p) => p.text),
    confidence: 'medium',
    notes: '',
    source: 'offline',
  };
}

/** Text: AI when configured (falls back to the on-device parser on failure). */
export async function estimateFromText(text: string): Promise<Estimate> {
  if (!foodAIEnabled()) return estimateOffline(text);
  try {
    return await callAI({ text });
  } catch {
    return estimateOffline(text);
  }
}

/** Photo: requires the AI service. */
export async function estimateFromPhoto(imageBase64: string, text?: string): Promise<Estimate> {
  if (!foodAIEnabled()) throw new Error('Photo AI is not set up');
  return callAI({ imageBase64, text });
}
