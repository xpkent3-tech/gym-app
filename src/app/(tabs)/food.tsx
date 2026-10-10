import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { CalorieRing } from '@/components/CalorieRing';
import { ConfirmButton } from '@/components/ConfirmButton';
import { Field } from '@/components/Field';
import { Body, Button, Card, Chip, H1, Label, ProgressBar, Row, Screen } from '@/components/ui';
import { addDays, formatDate, todayISO } from '@/lib/dates';
import { dailyTargets, dayTotals, MEALS, totals, trainingKcal, type NutritionGoal } from '@/lib/nutrition';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';

const MACRO_COLORS = { protein: '#FF5C7A', carbs: '#FFB020', fat: '#4C9EFF' };

function BodySetup() {
  const router = useRouter();
  const { profile, setProfile } = useStore();
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [goal, setGoal] = useState<NutritionGoal>('maintain');
  if (!profile) return null;
  const w = Number(weight.replace(',', '.'));
  const h = Number(height);
  const valid = w > 30 && w < 250 && h > 120 && h < 230;
  return (
    <Card testID="food-setup" style={{ borderColor: colors.primary }}>
      <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>Set your daily targets</Text>
      <Body>We use your size, goal and training to work out calories and macros. Apple Health can fill this in automatically on iPhone.</Body>
      <Row style={{ gap: 12 }}>
        <Field label="Weight (kg)" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" placeholder="75" testID="food-weight" />
        <Field label="Height (cm)" value={height} onChangeText={setHeight} keyboardType="number-pad" placeholder="180" testID="food-height" />
      </Row>
      <Row style={{ gap: 8 }}>
        {(['lose', 'maintain', 'gain'] as NutritionGoal[]).map((g) => (
          <Chip
            key={g}
            label={g === 'lose' ? 'Lose fat' : g === 'gain' ? 'Build muscle' : 'Maintain'}
            selected={goal === g}
            onPress={() => setGoal(g)}
            testID={`goal-${g}`}
          />
        ))}
      </Row>
      <Button title="❤️  Use Apple Health / body composition" variant="ghost" onPress={() => router.push('/body-comp')} testID="food-setup-health" />
      <Button
        title="Save targets"
        disabled={!valid}
        testID="food-setup-save"
        onPress={() => setProfile({ ...profile, body: { ...(profile.body ?? {}), weightKg: w, heightCm: h }, nutritionGoal: goal })}
      />
    </Card>
  );
}

function MacroBar({ label, eaten, target, color, testID }: { label: string; eaten: number; target: number; color: string; testID: string }) {
  return (
    <View style={{ flex: 1, gap: 4 }}>
      <Text style={{ color: colors.textDim, fontSize: 12, fontWeight: '700' }}>{label}</Text>
      <ProgressBar value={target ? eaten / target : 0} color={color} height={6} />
      <Text style={{ color: colors.text, fontWeight: '800', fontSize: 13 }} numberOfLines={1} testID={testID}>
        {Math.round(eaten)}
        <Text style={{ color: colors.textMuted, fontWeight: '600' }}>/{target}g</Text>
      </Text>
    </View>
  );
}

export default function Food() {
  const router = useRouter();
  const { profile, food, runs, sessions, deleteFood } = useStore();
  const today = todayISO();
  const [day, setDay] = useState(today);
  const eaten = useMemo(() => dayTotals(food, day), [food, day]);
  if (!profile) return null;
  const body = profile.body;
  const target = body ? dailyTargets(profile, body, profile.nutritionGoal ?? 'maintain', trainingKcal(runs, sessions, day, body.weightKg)) : null;
  const entries = food.filter((f) => f.date === day);

  return (
    <Screen testID="food-screen">
      <Row style={{ justifyContent: 'space-between' }}>
        <H1>Food</H1>
        <Row style={{ gap: 14 }}>
          <Pressable onPress={() => setDay(addDays(day, -1))} hitSlop={10} testID="food-prev-day">
            <Text style={{ color: colors.primary, fontSize: 20, fontWeight: '800' }}>‹</Text>
          </Pressable>
          <Text style={{ color: colors.text, fontWeight: '700' }} testID="food-day">
            {formatDate(day, today)}
          </Text>
          <Pressable onPress={() => setDay(addDays(day, 1))} disabled={day >= today} hitSlop={10} testID="food-next-day">
            <Text style={{ color: day >= today ? colors.textMuted : colors.primary, fontSize: 20, fontWeight: '800' }}>›</Text>
          </Pressable>
        </Row>
      </Row>

      {!target ? (
        <BodySetup />
      ) : (
        <Card style={{ alignItems: 'center', gap: 14 }} testID="food-summary">
          <Row style={{ gap: 20 }}>
            <CalorieRing eaten={eaten.kcal} target={target.kcal} />
            <View style={{ gap: 6 }}>
              <Label>Eaten</Label>
              <Text style={{ color: colors.text, fontSize: 22, fontWeight: '900' }} testID="food-kcal-eaten">
                {eaten.kcal} kcal
              </Text>
              <Label>Target</Label>
              <Text style={{ color: colors.textDim, fontSize: 16, fontWeight: '800' }} testID="food-kcal-target">
                {target.kcal} kcal
              </Text>
            </View>
          </Row>
          <Row style={{ gap: 12 }}>
            <MacroBar label="Protein" eaten={eaten.protein} target={target.protein} color={MACRO_COLORS.protein} testID="food-protein" />
            <MacroBar label="Carbs" eaten={eaten.carbs} target={target.carbs} color={MACRO_COLORS.carbs} testID="food-carbs" />
            <MacroBar label="Fat" eaten={eaten.fat} target={target.fat} color={MACRO_COLORS.fat} testID="food-fat" />
          </Row>
          {trainingKcal(runs, sessions, day, body!.weightKg) > 0 ? (
            <Body style={{ fontSize: 12, textAlign: 'center' }}>Includes extra fuel for today’s training.</Body>
          ) : null}
        </Card>
      )}

      {MEALS.map((m) => {
        const list = entries.filter((e) => e.meal === m.id);
        const t = totals(list.flatMap((e) => e.items));
        return (
          <Card key={m.id} testID={`meal-${m.id}`}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Text style={{ color: colors.text, fontSize: 17, fontWeight: '800' }}>
                {m.emoji} {m.label}
              </Text>
              <Row style={{ gap: 12 }}>
                <Text style={{ color: colors.textDim, fontWeight: '700' }} testID={`meal-${m.id}-kcal`}>
                  {t.kcal} kcal
                </Text>
                <Pressable
                  onPress={() => router.push({ pathname: '/food/add', params: { meal: m.id, date: day } })}
                  hitSlop={8}
                  testID={`meal-${m.id}-add`}
                  style={{ backgroundColor: colors.primary, borderRadius: 999, width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginTop: -2 }}>+</Text>
                </Pressable>
              </Row>
            </Row>
            {list.flatMap((e) =>
              e.items.map((it, i) => (
                <Row key={`${e.id}-${i}`} style={{ justifyContent: 'space-between', paddingVertical: 3 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text, fontWeight: '600' }} numberOfLines={1}>
                      {e.source === 'photo' ? '📸 ' : ''}
                      {it.name}
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                      {it.grams} g · P {Math.round(it.protein)} · C {Math.round(it.carbs)} · F {Math.round(it.fat)}
                    </Text>
                  </View>
                  <Text style={{ color: colors.textDim, fontWeight: '700' }}>{it.kcal}</Text>
                </Row>
              )),
            )}
            {list.length ? (
              <ConfirmButton
                title="Clear meal"
                confirmTitle="Delete"
                message={`Delete everything logged for ${m.label.toLowerCase()}?`}
                testID={`meal-${m.id}-clear`}
                subtle
                onConfirm={() => list.forEach((e) => deleteFood(e.id))}
              />
            ) : null}
          </Card>
        );
      })}
    </Screen>
  );
}
