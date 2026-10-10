import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { BodyPair } from '@/components/BodyMap';
import { ConfirmButton } from '@/components/ConfirmButton';
import { Body, Button, Card, H1, Label, Pill, Row, Screen, Stat } from '@/components/ui';
import { formatDate } from '@/lib/dates';
import { exerciseById } from '@/lib/exercises';
import { uid } from '@/lib/id';
import { muscleLabel } from '@/lib/muscles';
import { formatDuration } from '@/lib/pace';
import { XP } from '@/lib/progression';
import { formatSet, prsInSession, PR_LABEL, sessionStats, SET_TYPES } from '@/lib/strength';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';
import { useBodySex } from '@/lib/useBodySex';

export default function WorkoutSummary() {
  const sex = useBodySex();
  const { id, fresh } = useLocalSearchParams<{ id: string; fresh?: string }>();
  const router = useRouter();
  const { strength, deleteStrength, addRoutine, routines } = useStore();
  const session = strength.find((s) => s.id === id);
  const prs = useMemo(() => prsInSession(strength, id), [strength, id]);
  const back = () => (fresh ? router.dismissTo('/workouts') : router.canGoBack() ? router.back() : router.replace('/workouts'));
  if (!session) {
    return (
      <Screen>
        <Body>Workout not found.</Body>
        <Button title="Back" onPress={back} />
      </Screen>
    );
  }
  const stats = sessionStats(session);
  const exs = session.exercises.map((e) => ({ e, ex: exerciseById(e.exerciseId) }));
  const primary = [...new Set(exs.flatMap((x) => x.ex?.primary ?? []))];
  const secondary = [...new Set(exs.flatMap((x) => x.ex?.secondary ?? []))].filter((m) => !primary.includes(m));
  const title = session.name ?? (exs.length > 1 ? `${exs[0].ex?.name} + ${exs.length - 1} more` : (exs[0]?.ex?.name ?? 'Workout'));
  const saved = routines.some((r) => r.name === title);
  const xp = XP.strength + prs.length * XP.strengthPr;
  return (
    <Screen testID="workout-screen">
      <Pressable onPress={back} hitSlop={12} testID="workout-back">
        <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '600' }}>{fresh ? 'Done' : '‹ Back'}</Text>
      </Pressable>
      {fresh ? (
        <Card style={{ borderColor: colors.gold, alignItems: 'center', gap: 6 }} testID="workout-celebration">
          <Text style={{ fontSize: 30 }}>🎉</Text>
          <H1>Workout complete</H1>
          <Text style={{ color: colors.gold, fontWeight: '800', fontSize: 16 }} testID="workout-xp">
            +{xp} XP{prs.length ? ` · ${prs.length} PR${prs.length > 1 ? 's' : ''}` : ''}
          </Text>
        </Card>
      ) : (
        <H1>{title}</H1>
      )}
      <Body>{formatDate(session.date)}</Body>
      <Row style={{ gap: 8 }}>
        <Stat label="Time" value={session.durationSec ? formatDuration(session.durationSec) : '—'} />
        <Stat label="Volume" value={`${Math.round(stats.volume)} kg`} testID="workout-volume" />
        <Stat label="Sets" value={String(stats.sets)} />
      </Row>

      {prs.length ? (
        <Card testID="workout-prs">
          <Label>Personal records</Label>
          {prs.map((p) => (
            <Row key={p.exerciseId} style={{ gap: 8, flexWrap: 'wrap' }}>
              <Text style={{ fontSize: 18 }}>🏅</Text>
              <Text style={{ color: colors.text, fontWeight: '700' }}>{exerciseById(p.exerciseId)?.name}</Text>
              {p.kinds.map((k) => (
                <Pill key={k} text={PR_LABEL[k].toUpperCase()} color={colors.gold} />
              ))}
            </Row>
          ))}
        </Card>
      ) : null}

      <Card style={{ paddingVertical: 14 }}>
        <Label>Muscles worked</Label>
        <BodyPair sex={sex} primary={primary} secondary={secondary} width={92} />
        <Body style={{ textAlign: 'center', fontSize: 13 }}>{primary.map(muscleLabel).join(' · ')}</Body>
      </Card>

      {exs.map(({ e, ex }, i) => (
        <Card key={i} testID={`workout-ex-${i}`}>
          <Pressable onPress={() => router.push(`/exercise/${e.exerciseId}`)} testID={`workout-ex-link-${i}`}>
            <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '800' }}>{ex?.name ?? e.exerciseId}</Text>
          </Pressable>
          {e.note ? <Text style={{ color: colors.textDim, fontStyle: 'italic' }}>“{e.note}”</Text> : null}
          {e.sets.map((s, si) => {
            const badge = SET_TYPES.find((t) => t.id === (s.type ?? 'normal'))!.badge;
            return (
              <Row key={si} style={{ gap: 12 }}>
                <Text style={{ color: badge ? colors.warning : colors.textDim, width: 24, fontWeight: '800' }}>{badge || si + 1}</Text>
                <Text style={{ color: colors.text }}>{formatSet(s)}</Text>
              </Row>
            );
          })}
        </Card>
      ))}

      <Button
        title={saved ? 'Saved as routine ✓' : 'Save as routine'}
        variant="secondary"
        disabled={saved}
        testID="workout-save-routine"
        onPress={() =>
          addRoutine({
            id: uid(),
            name: title,
            createdAt: Date.now(),
            exercises: session.exercises.map((e) => ({ exerciseId: e.exerciseId, sets: e.sets.length, restSec: e.restSec })),
          })
        }
      />
      <View style={{ height: 4 }} />
      <ConfirmButton
        title="Delete workout"
        message="Delete this workout? Your records and history will update."
        confirmTitle="Delete"
        testID="workout-delete"
        subtle
        onConfirm={() => {
          deleteStrength(session.id);
          router.replace('/workouts');
        }}
      />
    </Screen>
  );
}
