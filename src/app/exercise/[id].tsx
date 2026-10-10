import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text } from 'react-native';

import { BodyPair } from '@/components/BodyMap';
import { ConfirmButton } from '@/components/ConfirmButton';
import { LineChart } from '@/components/LineChart';
import { Segmented } from '@/components/Segmented';
import { Body, Button, Card, Chip, H1, Label, Pill, Row, Screen } from '@/components/ui';
import { formatDate } from '@/lib/dates';
import { exerciseById } from '@/lib/exercises';
import { muscleLabel } from '@/lib/muscles';
import { CHART_METRICS, chartSeries, exerciseHistory, exerciseRecords, formatKg, formatSet, prsInSession, SET_TYPES, type ChartMetric } from '@/lib/strength';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';
import { useBodySex } from '@/lib/useBodySex';

type Tab = 'summary' | 'history' | 'howto';

export default function ExerciseDetail() {
  const sex = useBodySex();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { strength, deleteCustomExercise } = useStore();
  const [tab, setTab] = useState<Tab>('summary');
  const [metric, setMetric] = useState<ChartMetric>('heaviest');
  const ex = exerciseById(id);
  const history = useMemo(() => exerciseHistory(strength, id), [strength, id]);
  const records = useMemo(() => exerciseRecords(history), [history]);
  const back = () => (router.canGoBack() ? router.back() : router.replace('/'));
  if (!ex) {
    return (
      <Screen>
        <Body>Exercise not found.</Body>
        <Button title="Back" onPress={back} />
      </Screen>
    );
  }
  const unit = CHART_METRICS.find((m) => m.id === metric)!.unit;
  return (
    <Screen testID="exercise-screen">
      <Pressable onPress={back} hitSlop={12} testID="exercise-back">
        <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '600' }}>‹ Back</Text>
      </Pressable>
      <H1 testID="exercise-name">{ex.name}</H1>
      <Body>
        {ex.equipment}
        {ex.custom ? ' · Custom' : ''}
      </Body>
      <Segmented
        testID="exercise-tab"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'summary', label: 'Summary' },
          { value: 'history', label: 'History' },
          { value: 'howto', label: 'How to' },
        ]}
      />

      {tab === 'summary' ? (
        <>
          <Card>
            <Row style={{ gap: 6, flexWrap: 'wrap' }}>
              {CHART_METRICS.map((m) => (
                <Chip key={m.id} label={m.label} selected={metric === m.id} onPress={() => setMetric(m.id)} testID={`metric-${m.id}`} />
              ))}
            </Row>
            <LineChart points={chartSeries(history, metric)} unit={unit} testID="exercise-chart" />
          </Card>
          <Card testID="exercise-records">
            <Label>Personal records</Label>
            {history.length === 0 ? (
              <Body>No records yet.</Body>
            ) : (
              [
                ['Heaviest weight', formatKg(records.heaviest), 'pr-heaviest'],
                ['Est. one-rep max', formatKg(records.oneRepMax), 'pr-1rm'],
                ['Best set volume', formatKg(records.bestSetVolume), 'pr-setvol'],
                ['Best session volume', formatKg(records.bestSessionVolume), 'pr-sessionvol'],
              ].map(([label, value, tid]) => (
                <Row key={tid} style={{ justifyContent: 'space-between' }}>
                  <Text style={{ color: colors.textDim }}>🏅 {label}</Text>
                  <Text style={{ color: colors.text, fontWeight: '800' }} testID={tid}>
                    {value}
                  </Text>
                </Row>
              ))
            )}
          </Card>
        </>
      ) : null}

      {tab === 'history' ? (
        <>
          {history.length === 0 ? <Body testID="exercise-history-empty">No history yet. Log this exercise to see every session here.</Body> : null}
          {[...history].reverse().map((h, i) => {
            const prs = prsInSession(strength, h.sessionId).find((p) => p.exerciseId === id);
            return (
              <Card key={h.sessionId} onPress={() => router.push({ pathname: '/workout/[id]', params: { id: h.sessionId } })} testID={`exercise-history-${i}`}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Text style={{ color: colors.text, fontWeight: '800' }}>{formatDate(h.date)}</Text>
                  {prs ? <Pill text="PR" color={colors.gold} /> : null}
                </Row>
                {h.entry.sets.map((s, si) => {
                  const badge = SET_TYPES.find((t) => t.id === (s.type ?? 'normal'))!.badge;
                  return (
                    <Text key={si} style={{ color: colors.textDim }}>
                      {badge || si + 1}  {formatSet(s)}
                    </Text>
                  );
                })}
                {h.entry.note ? <Text style={{ color: colors.textMuted, fontStyle: 'italic' }}>“{h.entry.note}”</Text> : null}
              </Card>
            );
          })}
        </>
      ) : null}

      {tab === 'howto' ? (
        <>
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
          {ex.cues.length ? (
            <Card>
              <Label>Coaching cues</Label>
              {ex.cues.map((c, i) => (
                <Body key={i}>
                  {i + 1}. {c}
                </Body>
              ))}
            </Card>
          ) : null}
        </>
      ) : null}

      <Button title="Start workout with this" onPress={() => router.push({ pathname: '/strength', params: { add: ex.id } })} testID="exercise-start" />
      {ex.custom ? (
        <ConfirmButton
          title="Delete exercise"
          message="Delete this custom exercise? Past workouts keep their sets."
          confirmTitle="Delete"
          subtle
          testID="custom-delete"
          onConfirm={() => {
            deleteCustomExercise(ex.id);
            back();
          }}
        />
      ) : null}
    </Screen>
  );
}
