import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { z } from 'zod';

export const MealEstimate = z.object({
  items: z.array(
    z.object({
      name: z.string(),
      grams: z.number(),
      kcal: z.number(),
      protein_g: z.number(),
      carbs_g: z.number(),
      fat_g: z.number(),
    }),
  ),
  confidence: z.enum(['low', 'medium', 'high']),
  notes: z.string(),
});
export type MealEstimate = z.infer<typeof MealEstimate>;

const SYSTEM = `You are a sports nutritionist estimating what is on a plate for a calorie-tracking app used by athletes.
Identify every distinct food or drink. For each one estimate the edible portion in grams and its calories, protein, carbohydrate and fat for that portion, using standard food-composition values (USDA / McCance & Widdowson). Include cooking oils, sauces and dressings you can see or that the dish implies, as separate items.
Use visual cues (plate size ~26 cm, cutlery, hands, packaging) to judge portions. If a text description is given, honour the quantities it states.
Set confidence to "low" when portions or ingredients are hard to see. Use "notes" for one short sentence of caveats. If there is no food, return an empty items list and say so in notes.`;

export type EstimateInput = { imageBase64?: string; mediaType?: 'image/jpeg' | 'image/png' | 'image/webp'; text?: string };

export class RefusedError extends Error {}

export async function estimateMeal(client: Anthropic, input: EstimateInput): Promise<MealEstimate> {
  const content: Anthropic.Beta.BetaContentBlockParam[] = [];
  if (input.imageBase64) {
    content.push({ type: 'image', source: { type: 'base64', media_type: input.mediaType ?? 'image/jpeg', data: input.imageBase64 } });
  }
  content.push({
    type: 'text',
    text: input.text ? `Meal description from the athlete: ${input.text}` : 'Estimate the food in this photo.',
  });

  const response = await client.beta.messages.parse({
    model: 'claude-opus-5-5',
    max_tokens: 4000,
    // A quick perception task: low effort keeps snap-to-result latency short.
    output_config: { effort: 'low', format: betaZodOutputFormat(MealEstimate) },
    // Server-side refusal fallback: if a classifier declines, the API retries on a suitable model in the same call.
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system: SYSTEM,
    messages: [{ role: 'user', content }],
  });

  if (response.stop_reason === 'refusal') throw new RefusedError(response.stop_details?.explanation ?? 'Request declined');
  if (!response.parsed_output) throw new Error(`Unparseable response (stop_reason: ${response.stop_reason})`);
  return response.parsed_output;
}
