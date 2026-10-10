import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text } from 'react-native';

import { Field } from '@/components/Field';
import { Body, Button, Card, Chip, H1, Label, Row, Screen } from '@/components/ui';
import { EQUIPMENT, type Equipment } from '@/lib/exercises';
import { uid } from '@/lib/id';
import { MUSCLES, type MuscleId } from '@/lib/muscles';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';

export default function NewExercise() {
  const router = useRouter();
  const { addCustomExercise } = useStore();
  const [name, setName] = useState('');
  const [equipment, setEquipment] = useState<Equipment>('Other');
  const [primary, setPrimary] = useState<MuscleId[]>([]);
  const [secondary, setSecondary] = useState<MuscleId[]>([]);
  const back = () => (router.canGoBack() ? router.back() : router.replace('/exercises'));
  const toggle = (list: MuscleId[], m: MuscleId) => (list.includes(m) ? list.filter((x) => x !== m) : [...list, m]);
  const valid = name.trim().length > 1 && primary.length > 0;
  return (
    <Screen testID="exercise-new-screen">
      <Pressable onPress={back} hitSlop={12} testID="exercise-new-back">
        <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '600' }}>‹ Back</Text>
      </Pressable>
      <H1>Create exercise</H1>
      <Row>
        <Field label="Name" value={name} onChangeText={setName} placeholder="e.g. Sled Push" testID="custom-name" />
      </Row>
      <Card>
        <Label>Equipment</Label>
        <Row style={{ gap: 6, flexWrap: 'wrap' }}>
          {EQUIPMENT.map((e) => (
            <Chip key={e} label={e} selected={equipment === e} onPress={() => setEquipment(e)} testID={`custom-equip-${e}`} />
          ))}
        </Row>
      </Card>
      <Card>
        <Label>Primary muscles</Label>
        <Row style={{ gap: 6, flexWrap: 'wrap' }}>
          {MUSCLES.map((m) => (
            <Chip key={m.id} label={m.label} selected={primary.includes(m.id)} onPress={() => { setPrimary(toggle(primary, m.id)); setSecondary(secondary.filter((x) => x !== m.id)); }} testID={`custom-primary-${m.id}`} />
          ))}
        </Row>
      </Card>
      <Card>
        <Label>Secondary muscles (optional)</Label>
        <Row style={{ gap: 6, flexWrap: 'wrap' }}>
          {MUSCLES.filter((m) => !primary.includes(m.id)).map((m) => (
            <Chip key={m.id} label={m.label} color={colors.textDim} selected={secondary.includes(m.id)} onPress={() => setSecondary(toggle(secondary, m.id))} testID={`custom-secondary-${m.id}`} />
          ))}
        </Row>
      </Card>
      {!valid ? <Body>Enter a name and pick at least one primary muscle.</Body> : null}
      <Button
        title="Create exercise"
        disabled={!valid}
        testID="custom-save"
        onPress={() => {
          addCustomExercise({ id: `c-${uid()}`, name: name.trim(), equipment, primary, secondary, cues: [], why: 'Your custom exercise.', custom: true });
          back();
        }}
      />
    </Screen>
  );
}
