import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { ConfirmButton } from '@/components/ConfirmButton';
import { StrengthCard } from '@/components/StrengthCard';
import { Body, Button, Card, H1, Label, Row, Screen } from '@/components/ui';
import { exerciseById } from '@/lib/exercises';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';

export default function Workouts() {
  const router = useRouter();
  const { routines, deleteRoutine, strength } = useStore();
  const back = () => (router.canGoBack() ? router.back() : router.replace('/'));
  return (
    <Screen testID="workouts-screen">
      <Pressable onPress={back} hitSlop={12} testID="workouts-back">
        <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '600' }}>‹ Back</Text>
      </Pressable>
      <H1>Workout</H1>
      <Button title="Start empty workout" onPress={() => router.push('/strength')} testID="workouts-start-empty" />

      <Row style={{ justifyContent: 'space-between' }}>
        <Label>Routines</Label>
        <Pressable onPress={() => router.push('/routine/new')} hitSlop={8} testID="workouts-new-routine">
          <Text style={{ color: colors.primary, fontWeight: '700' }}>+ New routine</Text>
        </Pressable>
      </Row>
      {routines.length === 0 ? <Body testID="routines-empty">No routines yet. Create one, or finish a workout and tap “Save as routine”.</Body> : null}
      {routines.map((r, i) => (
        <Card key={r.id} testID={`routine-${i}`}>
          <Text style={{ color: colors.text, fontSize: 17, fontWeight: '800' }}>{r.name}</Text>
          <Text style={{ color: colors.textDim, fontSize: 13 }}>
            {r.exercises.map((e) => `${e.sets} × ${exerciseById(e.exerciseId)?.name ?? '?'}`).join(' · ')}
          </Text>
          <Row style={{ gap: 8 }}>
            <Button
              title="Start routine"
              style={{ flex: 1, minHeight: 40 }}
              testID={`routine-start-${i}`}
              onPress={() => router.push({ pathname: '/strength', params: { routine: r.id } })}
            />
            <View>
              <ConfirmButton title="Delete" message={`Delete “${r.name}”?`} confirmTitle="Delete" subtle testID={`routine-delete-${i}`} onConfirm={() => deleteRoutine(r.id)} />
            </View>
          </Row>
        </Card>
      ))}

      <Row style={{ justifyContent: 'space-between' }}>
        <Label>Exercises</Label>
        <Pressable onPress={() => router.push('/exercises')} hitSlop={8} testID="workouts-exercises">
          <Text style={{ color: colors.primary, fontWeight: '700' }}>Browse library ›</Text>
        </Pressable>
      </Row>

      <Label>History</Label>
      {strength.length === 0 ? <Body>No workouts yet.</Body> : null}
      {strength.slice(0, 10).map((s, i) => (
        <StrengthCard key={s.id} session={s} index={i} />
      ))}
    </Screen>
  );
}
