import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { BodyPair } from '@/components/BodyMap';
import { ConfirmButton } from '@/components/ConfirmButton';
import { Body, Button, Card, H1, Label, Pill, Row, Screen, Stat } from '@/components/ui';
import { formatDate } from '@/lib/dates';
import { intensities } from '@/lib/muscles';
import { formatDuration } from '@/lib/pace';
import { XP } from '@/lib/progression';
import { benchmarkTopPct, BENCHMARK_LABEL, hyroxTopPct } from '@/lib/sportRank';
import { HYROX_STATIONS, resultLabel, sessionLoadAU, sessionMuscleLoad, sportMeta, workoutById } from '@/lib/sports';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';
import { useBodySex } from '@/lib/useBodySex';
import { useInvite } from '@/lib/useInvite';

export default function SportSessionDetail() {
  const { id, fresh } = useLocalSearchParams<{ id: string; fresh?: string }>();
  const router = useRouter();
  const sex = useBodySex();
  const invite = useInvite();
  const { sessions, profile, deleteSession } = useStore();
  const s = sessions.find((x) => x.id === id);
  const heat = useMemo(() => (s ? intensities(sessionMuscleLoad(s)) : {}), [s]);
  // After a fresh save the stack holds hub → library → form; Done returns home rather than to the library.
  const done = () => (fresh === '1' ? router.dismissTo('/') : router.canGoBack() ? router.back() : router.replace('/'));
  if (!s || !profile) {
    return (
      <Screen>
        <Body>Workout not found.</Body>
        <Button title="Back" onPress={() => router.replace('/')} />
      </Screen>
    );
  }
  const w = workoutById(s.workoutId);
  const meta = sportMeta(s.sport);
  const isFresh = fresh === '1';
  const rank =
    w?.benchmark === 'hyrox-race' && s.resultSec
      ? { label: 'HYROX Open', pct: hyroxTopPct(s.resultSec, profile.sex, profile.age) }
      : w?.benchmark
        ? { label: BENCHMARK_LABEL[w.benchmark], pct: benchmarkTopPct(w.benchmark, s, profile.sex) }
        : null;

  return (
    <Screen testID="session-detail">
      <Row style={{ justifyContent: 'space-between' }}>
        <Pressable onPress={done} hitSlop={12} testID="session-back">
          <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '600' }}>{isFresh ? 'Done' : '‹ Back'}</Text>
        </Pressable>
        <Text style={{ color: colors.textMuted }}>{formatDate(s.date)}</Text>
      </Row>
      {isFresh ? (
        <View style={{ alignItems: 'center', gap: 4 }}>
          <Text style={{ fontSize: 44 }}>{meta.emoji}</Text>
          <H1 testID="session-saved">Workout saved</H1>
          <Text style={{ color: colors.primary, fontSize: 22, fontWeight: '900' }} testID="session-xp">
            +{XP.sport} XP
          </Text>
        </View>
      ) : null}
      <Card style={{ borderColor: meta.color + '66' }}>
        <Pill text={`${meta.label.toUpperCase()}`} color={meta.color} />
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }} testID="session-title">
          {w?.name} · {resultLabel(s)}
        </Text>
        <Row>
          <Stat label="Duration" value={`${s.durationMin} min`} />
          <Stat label="RPE" value={`${s.rpe}/10`} />
          <Stat label="Load" value={`${sessionLoadAU(s)} AU`} sub="min × RPE" />
        </Row>
        {s.minutesPlayed !== undefined || s.goals !== undefined ? (
          <Row>
            {s.minutesPlayed !== undefined ? <Stat label="Minutes played" value={String(s.minutesPlayed)} /> : null}
            {s.goals !== undefined ? <Stat label="Goals" value={`${s.goals} ⚽`} testID="session-goals" /> : null}
          </Row>
        ) : null}
        {s.notes ? <Body>“{s.notes}”</Body> : null}
      </Card>
      {rank && rank.pct !== null ? (
        <Card testID="session-rank" style={{ borderColor: colors.gold + '66' }}>
          <Label>{rank.label} rank</Label>
          <Text style={{ color: colors.gold, fontSize: 28, fontWeight: '900' }} testID="session-rank-pct">
            Top {rank.pct}%
          </Text>
          <Body>vs. {profile.sex === 'female' ? 'women' : 'men'} who have done it</Body>
        </Card>
      ) : null}
      {s.splits ? (
        <Card testID="session-splits">
          <Label>Station splits</Label>
          {HYROX_STATIONS.filter((st) => s.splits?.[st.id]).map((st) => (
            <Row key={st.id} style={{ justifyContent: 'space-between' }}>
              <Text style={{ color: colors.textDim }}>{st.name}</Text>
              <Text style={{ color: colors.text, fontWeight: '800' }}>{formatDuration(s.splits![st.id])}</Text>
            </Row>
          ))}
        </Card>
      ) : null}
      <Card testID="session-muscles">
        <Label>Muscles worked</Label>
        <BodyPair sex={sex} heat={heat} width={84} />
      </Card>
      {isFresh ? (
        <>
          <Button title="⚔️  Challenge a friend" variant="secondary" onPress={invite} testID="session-challenge" />
          <Button title="Done" onPress={done} testID="session-done" />
        </>
      ) : (
        <ConfirmButton
          title="Delete workout"
          confirmTitle="Delete"
          message="This removes the workout from your history, muscles and ranks."
          testID="session-delete"
          onConfirm={() => {
            deleteSession(s.id);
            done();
          }}
        />
      )}
    </Screen>
  );
}
