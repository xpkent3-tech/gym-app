import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text } from 'react-native';

import { ExercisePicker } from '@/components/ExercisePicker';
import { Field } from '@/components/Field';
import { Body, Button, Card, H1, Row, Screen } from '@/components/ui';
import { exerciseById } from '@/lib/exercises';
import { uid } from '@/lib/id';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';

export default function NewRoutine() {
  const router = useRouter();
  const { addRoutine } = useStore();
  const [name, setName] = useState('');
  const [items, setItems] = useState<{ exerciseId: string; sets: number }[]>([]);
  const [picking, setPicking] = useState(false);
  const back = () => (router.canGoBack() ? router.back() : router.replace('/workouts'));
  const valid = name.trim().length > 0 && items.length > 0;

  if (picking) {
    return (
      <Screen testID="routine-picker">
        <ExercisePicker already={items.map((i) => i.exerciseId)} onPick={(e) => setItems((l) => [...l, { exerciseId: e.id, sets: 3 }])} onClose={() => setPicking(false)} />
      </Screen>
    );
  }
  return (
    <Screen testID="routine-new-screen">
      <Pressable onPress={back} hitSlop={12} testID="routine-back">
        <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '600' }}>‹ Back</Text>
      </Pressable>
      <H1>New routine</H1>
      <Row>
        <Field label="Routine name" value={name} onChangeText={setName} placeholder="e.g. Runner legs" testID="routine-name" />
      </Row>
      {items.length === 0 ? <Body>Add the exercises you do in this session.</Body> : null}
      {items.map((it, i) => (
        <Card key={it.exerciseId} testID={`routine-ex-${i}`}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16, flex: 1 }}>{exerciseById(it.exerciseId)?.name}</Text>
            <Row style={{ gap: 14 }}>
              <Pressable onPress={() => setItems((l) => l.map((x, j) => (j === i ? { ...x, sets: Math.max(1, x.sets - 1) } : x)))} hitSlop={8} testID={`routine-ex-${i}-minus`}>
                <Text style={{ color: colors.primary, fontSize: 20, fontWeight: '800' }}>−</Text>
              </Pressable>
              <Text style={{ color: colors.text, fontWeight: '800' }} testID={`routine-ex-${i}-sets`}>
                {it.sets} sets
              </Text>
              <Pressable onPress={() => setItems((l) => l.map((x, j) => (j === i ? { ...x, sets: Math.min(10, x.sets + 1) } : x)))} hitSlop={8} testID={`routine-ex-${i}-plus`}>
                <Text style={{ color: colors.primary, fontSize: 20, fontWeight: '800' }}>+</Text>
              </Pressable>
              <Pressable onPress={() => setItems((l) => l.filter((_, j) => j !== i))} hitSlop={8}>
                <Text style={{ color: colors.danger, fontWeight: '700' }}>✕</Text>
              </Pressable>
            </Row>
          </Row>
        </Card>
      ))}
      <Button title="+ Add Exercise" variant="secondary" onPress={() => setPicking(true)} testID="routine-add-exercise" />
      <Button
        title="Save routine"
        disabled={!valid}
        testID="routine-save"
        onPress={() => {
          addRoutine({ id: uid(), name: name.trim(), createdAt: Date.now(), exercises: items.map((i) => ({ ...i, restSec: 90 })) });
          router.replace('/workouts');
        }}
      />
    </Screen>
  );
}
