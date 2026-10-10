import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, Text } from 'react-native';

import { BodyPair } from '@/components/BodyMap';
import { Body, Button, Card, H1, Label, Pill, Row, Screen } from '@/components/ui';
import { exerciseById } from '@/lib/exercises';
import { muscleLabel } from '@/lib/muscles';
import { colors } from '@/lib/theme';
import { useBodySex } from '@/lib/useBodySex';

export default function ExerciseDetail() {
  const sex = useBodySex();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const ex = exerciseById(id);
  const back = () => (router.canGoBack() ? router.back() : router.replace('/'));
  if (!ex) {
    return (
      <Screen>
        <Body>Exercise not found.</Body>
        <Button title="Back" onPress={back} />
      </Screen>
    );
  }
  return (
    <Screen testID="exercise-screen">
      <Pressable onPress={back} hitSlop={12} testID="exercise-back">
        <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '600' }}>‹ Back</Text>
      </Pressable>
      <H1 testID="exercise-name">{ex.name}</H1>
      <Body>{ex.equipment}</Body>
      <Card style={{ paddingVertical: 20 }}>
        <BodyPair sex={sex} primary={ex.primary} secondary={ex.secondary} width={140} />
        <Row style={{ gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
          {ex.primary.map((m) => (
            <Pill key={m} text={`PRIMARY · ${muscleLabel(m).toUpperCase()}`} color={colors.primary} testID={`exercise-primary-${m}`} />
          ))}
          {ex.secondary.map((m) => (
            <Pill key={m} text={muscleLabel(m).toUpperCase()} color={colors.textDim} testID={`exercise-secondary-${m}`} />
          ))}
        </Row>
      </Card>
      <Card>
        <Label>Why runners do it</Label>
        <Body>{ex.why}</Body>
      </Card>
      <Card>
        <Label>Coaching cues</Label>
        {ex.cues.map((c, i) => (
          <Body key={i}>
            {i + 1}. {c}
          </Body>
        ))}
      </Card>
      <Button title="Start workout with this" onPress={() => router.push({ pathname: '/strength', params: { add: ex.id } })} testID="exercise-start" />
    </Screen>
  );
}
