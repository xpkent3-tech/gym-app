import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text } from 'react-native';

import { Field } from '@/components/Field';
import { Body, Button, Card, Chip, H1, Label, Row, Screen } from '@/components/ui';
import { addDays, todayISO } from '@/lib/dates';
import { uid } from '@/lib/id';
import { parseDuration } from '@/lib/pace';
import { HYROX_STATIONS, sportMeta, workoutById } from '@/lib/sports';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';

export default function LogSportSession() {
  const { workout: workoutId } = useLocalSearchParams<{ workout: string }>();
  const router = useRouter();
  const { addSession } = useStore();
  const w = workoutById(workoutId);
  const [day, setDay] = useState(0);
  const [minutes, setMinutes] = useState(String(w?.defaultMin ?? 60));
  const [rpe, setRpe] = useState(7);
  const [time, setTime] = useState('');
  const [rounds, setRounds] = useState('');
  const [reps, setReps] = useState('');
  const [showSplits, setShowSplits] = useState(false);
  const [splits, setSplits] = useState<Record<string, string>>({});
  const [played, setPlayed] = useState(String(w?.defaultMin ?? 90));
  const [goals, setGoals] = useState('');
  const [notes, setNotes] = useState('');
  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  if (!w) {
    return (
      <Screen>
        <Body>Workout not found.</Body>
        <Button title="Back" onPress={close} />
      </Screen>
    );
  }
  const meta = sportMeta(w.sport);
  const min = Number(minutes);
  const resultSec = w.format === 'time' ? parseDuration(time) : null;
  const roundsNum = rounds === '' ? NaN : Number(rounds);
  const hint = !(min > 0)
    ? 'Enter how long the session took'
    : w.format === 'time' && resultSec === null
      ? 'Enter your finish time, e.g. 4:30 or 1:28:30'
      : w.format === 'amrap' && !(roundsNum >= 0)
        ? 'Enter completed rounds'
        : null;

  const save = () => {
    if (hint) return;
    const splitSecs = Object.fromEntries(
      Object.entries(splits)
        .map(([k, v]) => [k, parseDuration(v)] as const)
        .filter(([, v]) => v !== null),
    ) as Record<string, number>;
    const id = uid();
    addSession({
      id,
      date: addDays(todayISO(), -day),
      createdAt: Date.now(),
      sport: w.sport,
      workoutId: w.id,
      durationMin: w.format === 'time' && resultSec && !minutes ? Math.round(resultSec / 60) : min,
      rpe,
      resultSec: resultSec ?? undefined,
      rounds: w.format === 'amrap' ? roundsNum : undefined,
      reps: w.format === 'amrap' && reps ? Number(reps) : undefined,
      splits: Object.keys(splitSecs).length ? splitSecs : undefined,
      minutesPlayed: w.match ? Number(played) || undefined : undefined,
      goals: w.match && goals ? Number(goals) : undefined,
      notes: notes.trim(),
    });
    router.replace({ pathname: '/sport/session/[id]', params: { id, fresh: '1' } });
  };

  return (
    <Screen testID="sport-log">
      <Row style={{ justifyContent: 'space-between' }}>
        <Pressable onPress={close} hitSlop={12} testID="sport-log-cancel">
          <Text style={{ color: colors.textDim, fontSize: 16 }}>Cancel</Text>
        </Pressable>
        <Text style={{ color: meta.color, fontWeight: '800' }}>
          {meta.emoji} {meta.label}
        </Text>
        <Pressable onPress={save} disabled={!!hint} hitSlop={12} testID="sport-log-save-top">
          <Text style={{ color: hint ? colors.textMuted : colors.primary, fontWeight: '800', fontSize: 16 }}>Save</Text>
        </Pressable>
      </Row>
      <H1 testID="sport-log-title">{w.name}</H1>
      <Body>{w.description}</Body>

      <Card>
        <Row style={{ gap: 8 }}>
          {['Today', 'Yesterday'].map((d, i) => (
            <Chip key={d} label={d} selected={day === i} onPress={() => setDay(i)} testID={`sport-day-${i}`} />
          ))}
        </Row>
        {w.format === 'time' ? (
          <Field label="Finish time" value={time} onChangeText={setTime} placeholder={w.defaultMin >= 60 ? '1:28:30' : '4:30'} testID="sport-time" />
        ) : null}
        {w.format === 'amrap' ? (
          <Row style={{ gap: 12 }}>
            <Field
              label="Rounds"
              value={rounds}
              onChangeText={(t) => setRounds(t.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              placeholder="18"
              testID="sport-rounds"
            />
            <Field
              label="+ Reps"
              value={reps}
              onChangeText={(t) => setReps(t.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              placeholder="0"
              testID="sport-reps"
            />
          </Row>
        ) : null}
        <Field
          label="Session length (min)"
          value={minutes}
          onChangeText={(t) => setMinutes(t.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
          testID="sport-minutes"
        />
        {w.match ? (
          <Row style={{ gap: 12 }}>
            <Field
              label="Minutes played"
              value={played}
              onChangeText={(t) => setPlayed(t.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              testID="sport-played"
            />
            <Field
              label="Goals"
              value={goals}
              onChangeText={(t) => setGoals(t.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              placeholder="0"
              testID="sport-goals"
            />
          </Row>
        ) : null}
        {hint ? <Body testID="sport-hint">{hint}</Body> : null}
      </Card>

      {w.splits ? (
        <Card>
          <Pressable onPress={() => setShowSplits(!showSplits)} testID="sport-splits-toggle">
            <Row style={{ justifyContent: 'space-between' }}>
              <Label>Station splits (optional)</Label>
              <Text style={{ color: colors.primary, fontWeight: '700' }}>{showSplits ? 'Hide' : 'Add'}</Text>
            </Row>
          </Pressable>
          {showSplits
            ? HYROX_STATIONS.map((st, i) => (
                <Field
                  key={st.id}
                  label={`${i + 1}. ${st.name}`}
                  value={splits[st.id] ?? ''}
                  onChangeText={(v) => setSplits((s) => ({ ...s, [st.id]: v }))}
                  placeholder="m:ss"
                  testID={`split-${st.id}`}
                />
              ))
            : null}
        </Card>
      ) : null}

      <Card>
        <Label>How hard? RPE {rpe}/10</Label>
        <Row style={{ gap: 4 }}>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <Pressable
              key={n}
              onPress={() => setRpe(n)}
              testID={`sport-rpe-${n}`}
              style={{
                flex: 1,
                height: 36,
                borderRadius: 9,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: n <= rpe ? (n > 7 ? colors.danger : n > 4 ? colors.warning : colors.success) : colors.surfaceAlt,
              }}
            >
              <Text style={{ color: n <= rpe ? '#111' : colors.textDim, fontWeight: '800' }}>{n}</Text>
            </Pressable>
          ))}
        </Row>
        <Field
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder={w.name.startsWith('Custom') ? 'Describe the WOD' : 'How did it go?'}
          multiline
          testID="sport-notes"
          style={{ minHeight: 64 }}
        />
      </Card>

      <Button title="Save workout" onPress={save} disabled={!!hint} testID="sport-log-save" />
    </Screen>
  );
}
