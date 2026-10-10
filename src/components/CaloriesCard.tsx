import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { CalorieRing } from '@/components/CalorieRing';
import { Body, Button, Card, Label, ProgressBar, Row } from '@/components/ui';
import { todayISO } from '@/lib/dates';
import { dailyTargets, dayTotals, trainingKcal } from '@/lib/nutrition';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';

const MACROS = [
  { key: 'protein', label: 'Protein', color: '#FF5C7A' },
  { key: 'carbs', label: 'Carbs', color: '#FFB020' },
  { key: 'fat', label: 'Fat', color: '#4C9EFF' },
] as const;

/** Today's calories and macros on Home, with a one-tap Log food shortcut. */
export function CaloriesCard() {
  const router = useRouter();
  const { profile, food, runs, sessions } = useStore();
  const today = todayISO();
  if (!profile) return null;

  if (!profile.body) {
    return (
      <Card onPress={() => router.push('/food')} testID="home-calories-setup">
        <Row style={{ justifyContent: 'space-between' }}>
          <Label>Calories</Label>
          <Text style={{ color: colors.primary, fontWeight: '700' }}>Set up ›</Text>
        </Row>
        <Text style={{ color: colors.text, fontSize: 17, fontWeight: '800' }}>Set up calorie targets</Text>
        <Body>Add your weight and height to track calories and macros with photo, text or search.</Body>
      </Card>
    );
  }

  const eaten = dayTotals(food, today);
  const target = dailyTargets(profile, profile.body, profile.nutritionGoal ?? 'maintain', trainingKcal(runs, sessions, today, profile.body.weightKg));
  const left = target.kcal - eaten.kcal;
  const hour = new Date().getHours();
  const meal = hour < 11 ? 'breakfast' : hour < 15 ? 'lunch' : hour < 21 ? 'dinner' : 'snacks';

  return (
    <Card testID="home-calories">
      <Row style={{ justifyContent: 'space-between' }}>
        <Label>Calories today</Label>
        <Text onPress={() => router.push('/food')} style={{ color: colors.primary, fontWeight: '700' }} testID="home-calories-open">
          Food ›
        </Text>
      </Row>
      <Row style={{ gap: 16 }}>
        <CalorieRing eaten={eaten.kcal} target={target.kcal} size={104} />
        <View style={{ flex: 1, gap: 8 }}>
          <Text style={{ color: colors.text, fontWeight: '800', fontSize: 15 }} testID="home-calories-eaten">
            {eaten.kcal} / {target.kcal} kcal
          </Text>
          {MACROS.map((m) => (
            <View key={m.key} style={{ gap: 2 }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Text style={{ color: colors.textDim, fontSize: 11, fontWeight: '700' }}>{m.label}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                  {Math.round(eaten[m.key])}/{target[m.key]}g
                </Text>
              </Row>
              <ProgressBar value={target[m.key] ? eaten[m.key] / target[m.key] : 0} color={m.color} height={5} />
            </View>
          ))}
        </View>
      </Row>
      <Button
        title={left > 0 ? `+ Log food · ${left} kcal left` : '+ Log food'}
        onPress={() => router.push({ pathname: '/food/add', params: { meal } })}
        testID="home-calories-add"
      />
    </Card>
  );
}
