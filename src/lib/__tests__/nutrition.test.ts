import { dailyTargets, dayTotals, FOODS, foodById, itemFor, parseMealText, scaleItem, searchFoods, trainingKcal } from '../nutrition';
import { run } from './helpers';

describe('food database', () => {
  it('has plausible macros (Atwater 4/4/9/7 within 15 %; fibre-heavy veg within 35 %)', () => {
    expect(FOODS.length).toBeGreaterThan(60);
    for (const f of FOODS) {
      if (f.kcal < 20) continue;
      const est = f.protein * 4 + f.carbs * 4 + f.fat * 9 + (f.alcohol ?? 0) * 7;
      expect(Math.abs(est - f.kcal) / f.kcal).toBeLessThan(f.kcal < 50 ? 0.35 : 0.15);
    }
  });

  it('search: chicken breast 150 g ≈ 248 kcal, 47 g protein', () => {
    const f = searchFoods('chicken').find((x) => x.id === 'chicken-breast')!;
    const it = itemFor(f, 150);
    expect(it.kcal).toBe(248);
    expect(Math.round(it.protein)).toBe(47);
  });

  it('scales portions proportionally', () => {
    const it = { name: 'x', grams: 100, kcal: 200, protein: 10, carbs: 20, fat: 5 };
    expect(scaleItem(it, 150)).toMatchObject({ grams: 150, kcal: 300, protein: 15, carbs: 30, fat: 7.5 });
  });
});

describe('meal text parser', () => {
  it('parses "2 eggs and a banana"', () => {
    const r = parseMealText('2 eggs and a banana');
    expect(r.map((p) => p.item?.foodId)).toEqual(['egg', 'banana']);
    expect(r[0].item!.grams).toBe(100);
    expect(r[1].item!.grams).toBe(120);
  });

  it('handles grams, aliases, longest match and unknowns', () => {
    const r = parseMealText('150g rice, toast with peanut butter, sweet potato, unicorn steak pie');
    expect(r[0].item).toMatchObject({ foodId: 'rice', grams: 150 });
    expect(r[1].item?.foodId).toBe('bread');
    expect(r[2].item?.foodId).toBe('peanut-butter');
    expect(r[3].item?.foodId).toBe('sweet-potato');
    expect(foodById('steak')).toBeDefined();
  });
});

describe('targets', () => {
  const p = { sex: 'male' as const, age: 30 };
  it('maintain on a rest day ≈ 2,335 kcal, 135 g protein', () => {
    const t = dailyTargets(p, { weightKg: 75, heightCm: 180 }, 'maintain');
    expect(t.kcal).toBe(2336);
    expect(t.protein).toBe(135);
    expect(t.protein * 4 + t.carbs * 4 + t.fat * 9).toBeGreaterThan(t.kcal - 10);
  });

  it('uses body fat (Katch-McArdle), goals and training energy', () => {
    const lean = dailyTargets(p, { weightKg: 75, heightCm: 180, bodyFatPct: 12 }, 'maintain');
    expect(lean.kcal).not.toBe(2336);
    expect(dailyTargets(p, { weightKg: 75, heightCm: 180 }, 'lose').kcal).toBeLessThan(2336);
    const e = trainingKcal([run({ date: '2026-10-10', distanceKm: 10, durationSec: 3000 })], [], '2026-10-10', 75);
    expect(e).toBe(750);
    expect(dailyTargets(p, { weightKg: 75, heightCm: 180 }, 'maintain', e).kcal).toBe(2336 + 525);
  });

  it('totals a day', () => {
    const t = dayTotals(
      [
        {
          id: 'a',
          date: '2026-10-10',
          createdAt: 1,
          meal: 'lunch',
          source: 'manual',
          items: [{ name: 'x', grams: 1, kcal: 500, protein: 30, carbs: 50, fat: 10 }],
        },
        {
          id: 'b',
          date: '2026-10-09',
          createdAt: 1,
          meal: 'lunch',
          source: 'manual',
          items: [{ name: 'y', grams: 1, kcal: 900, protein: 1, carbs: 1, fat: 1 }],
        },
      ],
      '2026-10-10',
    );
    expect(t).toEqual({ kcal: 500, protein: 30, carbs: 50, fat: 10 });
  });
});
