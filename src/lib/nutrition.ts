import { addDays } from './dates';
import type { Profile, Run } from './types';
import type { SportSession } from './sports';

export interface Food {
  id: string;
  name: string;
  /** Per 100 g. */
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  /** A natural portion, e.g. "egg" = 50 g. */
  unit: string;
  unitGrams: number;
  aliases?: string[];
  /** Grams of alcohol per 100 g (7 kcal/g; not a macronutrient). */
  alcohol?: number;
}

const ALCOHOL: Record<string, number> = { beer: 3.9, wine: 10.6 };

// [id, name, kcal, P, C, F per 100 g, unit, unitGrams, aliases]
type Row = [string, string, number, number, number, number, string, number, string[]?];
const ROWS: Row[] = [
  ['egg', 'Egg, whole', 143, 12.6, 0.7, 9.5, 'egg', 50, ['eggs']],
  ['egg-white', 'Egg white', 52, 10.9, 0.7, 0.2, 'white', 33],
  ['chicken-breast', 'Chicken breast, cooked', 165, 31, 0, 3.6, 'breast', 170, ['chicken']],
  ['chicken-thigh', 'Chicken thigh, cooked', 209, 26, 0, 10.9, 'thigh', 110],
  ['beef-mince', 'Beef mince 10%, cooked', 217, 26, 0, 12, 'serving', 125, ['ground beef', 'mince']],
  ['steak', 'Steak, sirloin cooked', 206, 30, 0, 9, 'steak', 200],
  ['salmon', 'Salmon, cooked', 206, 22, 0, 12.4, 'fillet', 150],
  ['tuna', 'Tuna, canned in water', 116, 26, 0, 1, 'can', 120],
  ['shrimp', 'Shrimp, cooked', 99, 24, 0.2, 0.3, 'serving', 100, ['prawns']],
  ['tofu', 'Tofu, firm', 144, 17, 3, 9, 'serving', 120],
  ['turkey', 'Turkey breast, sliced', 104, 21, 2, 1.5, 'slice', 25],
  ['ham', 'Ham, sliced', 145, 21, 1.5, 6, 'slice', 25],
  ['bacon', 'Bacon, cooked', 541, 37, 1.4, 42, 'rasher', 10],
  ['greek-yogurt', 'Greek yogurt, 0%', 59, 10, 3.6, 0.4, 'pot', 170, ['yogurt', 'yoghurt', 'skyr']],
  ['milk', 'Milk, semi-skimmed', 50, 3.4, 4.8, 1.8, 'glass', 250],
  ['whey', 'Whey protein', 400, 80, 8, 6, 'scoop', 30, ['protein shake', 'protein powder', 'shake']],
  ['cottage-cheese', 'Cottage cheese', 98, 11, 3.4, 4.3, 'cup', 225],
  ['cheese', 'Cheddar cheese', 403, 25, 1.3, 33, 'slice', 20],
  ['mozzarella', 'Mozzarella', 280, 28, 3, 17, 'ball', 125],
  ['butter', 'Butter', 717, 0.9, 0.1, 81, 'tbsp', 14],
  ['olive-oil', 'Olive oil', 884, 0, 0, 100, 'tbsp', 13.5, ['oil']],
  ['avocado', 'Avocado', 160, 2, 8.5, 14.7, 'avocado', 150],
  ['peanut-butter', 'Peanut butter', 588, 25, 20, 50, 'tbsp', 16],
  ['almonds', 'Almonds', 579, 21, 22, 50, 'handful', 28, ['nuts']],
  ['oats', 'Oats, dry', 389, 16.9, 66, 6.9, 'serving', 40, ['oatmeal', 'porridge']],
  ['bread', 'Bread, wholemeal', 247, 13, 41, 3.4, 'slice', 35, ['toast']],
  ['white-bread', 'Bread, white', 265, 9, 49, 3.2, 'slice', 30],
  ['bagel', 'Bagel', 257, 10, 50, 1.6, 'bagel', 95],
  ['rice', 'Rice, white cooked', 130, 2.7, 28, 0.3, 'cup', 160],
  ['brown-rice', 'Rice, brown cooked', 123, 2.7, 25.6, 1, 'cup', 160],
  ['pasta', 'Pasta, cooked', 158, 5.8, 31, 0.9, 'cup', 140, ['spaghetti', 'penne', 'noodles']],
  ['potato', 'Potato, boiled', 87, 1.9, 20, 0.1, 'potato', 170, ['potatoes']],
  ['sweet-potato', 'Sweet potato, baked', 90, 2, 20.7, 0.2, 'potato', 150],
  ['fries', 'French fries', 312, 3.4, 41, 15, 'portion', 115, ['chips']],
  ['quinoa', 'Quinoa, cooked', 120, 4.4, 21, 1.9, 'cup', 185],
  ['tortilla', 'Tortilla wrap', 310, 8, 52, 7.5, 'wrap', 60, ['wrap']],
  ['granola', 'Granola', 471, 10, 64, 20, 'serving', 50],
  ['cereal', 'Breakfast cereal', 379, 7, 84, 1.5, 'bowl', 40, ['cornflakes']],
  ['banana', 'Banana', 89, 1.1, 22.8, 0.3, 'banana', 120, ['bananas']],
  ['apple', 'Apple', 52, 0.3, 13.8, 0.2, 'apple', 180, ['apples']],
  ['orange', 'Orange', 47, 0.9, 11.8, 0.1, 'orange', 150],
  ['berries', 'Mixed berries', 50, 0.8, 12, 0.3, 'cup', 145, ['blueberries', 'strawberries']],
  ['grapes', 'Grapes', 69, 0.7, 18, 0.2, 'cup', 150],
  ['dates', 'Medjool dates', 277, 1.8, 75, 0.2, 'date', 24],
  ['raisins', 'Raisins', 299, 3.1, 79, 0.5, 'box', 40],
  ['broccoli', 'Broccoli', 34, 2.8, 7, 0.4, 'cup', 90],
  ['spinach', 'Spinach', 23, 2.9, 3.6, 0.4, 'cup', 30],
  ['salad', 'Mixed salad greens', 17, 1.3, 3, 0.2, 'bowl', 100],
  ['tomato', 'Tomato', 18, 0.9, 3.9, 0.2, 'tomato', 120],
  ['carrot', 'Carrot', 41, 0.9, 9.6, 0.2, 'carrot', 60],
  ['beans', 'Black beans, cooked', 132, 8.9, 23.7, 0.5, 'cup', 170, ['kidney beans']],
  ['chickpeas', 'Chickpeas, cooked', 164, 8.9, 27, 2.6, 'cup', 165],
  ['lentils', 'Lentils, cooked', 116, 9, 20, 0.4, 'cup', 200],
  ['hummus', 'Hummus', 166, 7.9, 14, 9.6, 'tbsp', 30],
  ['pizza', 'Pizza, margherita', 266, 11, 33, 10, 'slice', 110],
  ['burger', 'Cheeseburger', 263, 13, 26, 12, 'burger', 200, ['hamburger']],
  ['sushi', 'Sushi roll', 150, 5, 30, 1, 'piece', 30],
  ['burrito', 'Chicken burrito', 206, 10, 24, 7.5, 'burrito', 350],
  ['sandwich', 'Chicken sandwich', 230, 14, 25, 8, 'sandwich', 200],
  ['soup', 'Vegetable soup', 35, 1.5, 6, 0.6, 'bowl', 300],
  ['honey', 'Honey', 304, 0.3, 82, 0, 'tbsp', 21],
  ['jam', 'Jam', 250, 0.4, 62, 0.1, 'tbsp', 20],
  ['chocolate', 'Dark chocolate', 546, 4.9, 61, 31, 'square', 10],
  ['protein-bar', 'Protein bar', 360, 33, 38, 10, 'bar', 60],
  ['energy-gel', 'Energy gel', 270, 0, 68, 0, 'gel', 32, ['gel']],
  ['sports-drink', 'Sports drink', 26, 0, 6.4, 0, 'bottle', 500, ['gatorade', 'isotonic']],
  ['rice-cake', 'Rice cake', 387, 8, 81, 2.8, 'cake', 9],
  ['coffee', 'Coffee, black', 2, 0.3, 0, 0, 'cup', 240],
  ['latte', 'Latte', 54, 3.4, 5.3, 2, 'cup', 350, ['cappuccino', 'flat white']],
  ['orange-juice', 'Orange juice', 45, 0.7, 10.4, 0.2, 'glass', 250, ['juice']],
  ['beer', 'Beer', 43, 0.5, 3.6, 0, 'pint', 568],
  ['wine', 'Wine', 85, 0.1, 2.6, 0, 'glass', 175],
  ['soda', 'Cola', 42, 0, 10.6, 0, 'can', 330, ['coke']],
];

export const FOODS: Food[] = ROWS.map(([id, name, kcal, protein, carbs, fat, unit, unitGrams, aliases]) => ({
  id,
  name,
  kcal,
  protein,
  carbs,
  fat,
  unit,
  unitGrams,
  aliases,
  alcohol: ALCOHOL[id],
}));

export const foodById = (id: string) => FOODS.find((f) => f.id === id);

export interface FoodItem {
  name: string;
  grams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  foodId?: string;
}

export type Meal = 'breakfast' | 'lunch' | 'dinner' | 'snacks';
export const MEALS: { id: Meal; label: string; emoji: string }[] = [
  { id: 'breakfast', label: 'Breakfast', emoji: '🍳' },
  { id: 'lunch', label: 'Lunch', emoji: '🥗' },
  { id: 'dinner', label: 'Dinner', emoji: '🍝' },
  { id: 'snacks', label: 'Snacks', emoji: '🍌' },
];

export type FoodSource = 'photo' | 'text' | 'search' | 'manual';

export interface FoodEntry {
  id: string;
  date: string;
  createdAt: number;
  meal: Meal;
  source: FoodSource;
  items: FoodItem[];
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export function itemFor(food: Food, grams: number): FoodItem {
  const k = grams / 100;
  return {
    name: food.name,
    grams: Math.round(grams),
    kcal: Math.round(food.kcal * k),
    protein: round1(food.protein * k),
    carbs: round1(food.carbs * k),
    fat: round1(food.fat * k),
    foodId: food.id,
  };
}

/** Rescale an item to a new weight, keeping its per-gram composition. */
export function scaleItem(item: FoodItem, grams: number): FoodItem {
  if (item.grams <= 0) return { ...item, grams };
  const k = grams / item.grams;
  return {
    ...item,
    grams: Math.round(grams),
    kcal: Math.round(item.kcal * k),
    protein: round1(item.protein * k),
    carbs: round1(item.carbs * k),
    fat: round1(item.fat * k),
  };
}

export interface Macros {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export function totals(items: FoodItem[]): Macros {
  return items.reduce(
    (t, i) => ({ kcal: t.kcal + i.kcal, protein: round1(t.protein + i.protein), carbs: round1(t.carbs + i.carbs), fat: round1(t.fat + i.fat) }),
    {
      kcal: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    },
  );
}

export function dayTotals(entries: FoodEntry[], date: string): Macros {
  return totals(entries.filter((e) => e.date === date).flatMap((e) => e.items));
}

export function searchFoods(query: string): Food[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return FOODS.filter((f) => f.name.toLowerCase().includes(q) || f.aliases?.some((a) => a.includes(q)) || f.id.includes(q)).slice(0, 12);
}

function matchFood(phrase: string): Food | undefined {
  const p = phrase
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!p) return undefined;
  const singular = p.replace(/(es|s)$/, '');
  // Prefer the longest alias / name hit so "sweet potato" beats "potato".
  let best: { food: Food; score: number } | undefined;
  for (const f of FOODS) {
    const names = [f.name.toLowerCase().split(',')[0], f.id.replace(/-/g, ' '), ...(f.aliases ?? [])];
    for (const n of names) {
      if (p.includes(n) || n.includes(singular) || singular.includes(n)) {
        const score = n.length + (p === n ? 100 : 0);
        if (!best || score > best.score) best = { food: f, score };
      }
    }
  }
  return best?.food;
}

const WORD_NUM: Record<string, number> = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, half: 0.5, some: 1 };

export interface ParsedPart {
  text: string;
  item: FoodItem | null;
}

/** On-device parser: "2 eggs, toast and a banana" → items using the food DB's natural units. */
export function parseMealText(text: string): ParsedPart[] {
  return text
    .split(/,|\band\b|\bwith\b|\+|\n/i)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((part) => {
      let rest = part.toLowerCase();
      let grams: number | null = null;
      let qty = 1;
      const g = rest.match(/(\d+(?:\.\d+)?)\s*(g|grams?|ml)\b/);
      if (g) {
        grams = Number(g[1]);
        rest = rest.replace(g[0], ' ');
      } else {
        const n = rest.match(/^(\d+(?:\.\d+)?|a|an|one|two|three|four|five|six|half|some)\b/);
        if (n) {
          qty = /\d/.test(n[1]) ? Number(n[1]) : WORD_NUM[n[1]];
          rest = rest.slice(n[0].length);
        }
      }
      rest = rest.replace(/\b(of|slices?|cups?|bowls?|glass(es)?|scoops?|pieces?|tbsp|handfuls?)\b/g, ' ');
      const food = matchFood(rest);
      if (!food) return { text: part, item: null };
      return { text: part, item: itemFor(food, grams ?? qty * food.unitGrams) };
    });
}

export type NutritionGoal = 'lose' | 'maintain' | 'gain';

export interface Body {
  weightKg: number;
  heightCm: number;
  bodyFatPct?: number;
}

/** Katch-McArdle when body fat is known, otherwise Mifflin-St Jeor. */
export function bmr(profile: Pick<Profile, 'sex' | 'age'>, body: Body): number {
  if (body.bodyFatPct && body.bodyFatPct > 2 && body.bodyFatPct < 60) {
    const lean = body.weightKg * (1 - body.bodyFatPct / 100);
    return 370 + 21.6 * lean;
  }
  return 10 * body.weightKg + 6.25 * body.heightCm - 5 * profile.age + (profile.sex === 'male' ? 5 : -161);
}

/** Estimated training energy for a day: runs ≈ 1 kcal/kg/km; sport sessions ≈ 7 kcal per session-RPE unit (min × RPE / 10 × 70). */
export function trainingKcal(runs: Run[], sessions: SportSession[], date: string, weightKg: number): number {
  const runK = runs.filter((r) => r.date === date).reduce((s, r) => s + r.distanceKm * weightKg, 0);
  const sportK = sessions.filter((s) => s.date === date).reduce((s, x) => s + x.durationMin * x.rpe * 0.7, 0);
  return runK + sportK;
}

export function dailyTargets(profile: Pick<Profile, 'sex' | 'age'>, body: Body, goal: NutritionGoal, trainingEnergy = 0): Macros {
  const adj = goal === 'lose' ? 0.8 : goal === 'gain' ? 1.1 : 1;
  const kcal = Math.round((bmr(profile, body) * 1.35 + trainingEnergy * 0.7) * adj);
  const protein = Math.round(body.weightKg * 1.8);
  const fat = Math.round((kcal * 0.25) / 9);
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  return { kcal, protein, carbs, fat };
}

export function recentDays(today: string, n = 7): string[] {
  return Array.from({ length: n }, (_, i) => addDays(today, -i));
}
