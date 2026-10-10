import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { BodyMap, BodyPair, type BodyView } from '@/components/BodyMap';
import { Field } from '@/components/Field';
import { useToast } from '@/components/Toast';
import { Body, Button, Card, Chip, H1, Label, Row, Screen } from '@/components/ui';
import { todayISO } from '@/lib/dates';
import { exerciseById, searchExercises, type Exercise } from '@/lib/exercises';
import { uid } from '@/lib/id';
import { muscleLabel, type MuscleId } from '@/lib/muscles';
import { formatDuration } from '@/lib/pace';
import { XP } from '@/lib/progression';
import { useStore } from '@/lib/store';
import { useBodySex } from '@/lib/useBodySex';
import { colors, radius } from '@/lib/theme';

interface DraftSet {
  kg: string;
  reps: string;
}
interface DraftExercise {
  exerciseId: string;
  sets: DraftSet[];
}

const BACK_MUSCLES: MuscleId[] = ['glutes', 'hamstrings', 'lats', 'upperBack', 'lowerBack', 'triceps', 'calves'];
const thumbView = (e: Exercise): BodyView => (e.primary.some((m) => BACK_MUSCLES.includes(m)) ? 'back' : 'front');
const FILTERS: MuscleId[] = ['glutes', 'hamstrings', 'quads', 'calves', 'abs', 'obliques', 'hipFlexors', 'adductors', 'tibialis', 'upperBack', 'chest'];
const emptySets = (): DraftSet[] => [0, 1, 2].map(() => ({ kg: '', reps: '' }));

function ExercisePicker({ onPick, onClose, already }: { onPick: (e: Exercise) => void; onClose: () => void; already: string[] }) {
  const sex = useBodySex();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [muscle, setMuscle] = useState<MuscleId | null>(null);
  const list = searchExercises(query, muscle);
  return (
    <View style={{ gap: 12 }} testID="picker">
      <Row style={{ justifyContent: 'space-between' }}>
        <H1>Add exercise</H1>
        <Pressable onPress={onClose} hitSlop={10} testID="picker-close">
          <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 16 }}>Done</Text>
        </Pressable>
      </Row>
      <Field label="Search" value={query} onChangeText={setQuery} placeholder="e.g. squat" testID="picker-search" autoCapitalize="none" />
      <Row style={{ gap: 6, flexWrap: 'wrap' }}>
        <Chip label="All muscles" selected={!muscle} onPress={() => setMuscle(null)} testID="filter-all" />
        {FILTERS.map((m) => (
          <Chip key={m} label={muscleLabel(m)} selected={muscle === m} onPress={() => setMuscle(muscle === m ? null : m)} testID={`filter-${m}`} />
        ))}
      </Row>
      {list.length === 0 ? <Body>No exercises match.</Body> : null}
      {list.map((e, i) => {
        const added = already.includes(e.id);
        return (
          <Card key={e.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 }}>
            <View style={{ backgroundColor: colors.bg, borderRadius: 10 }}>
              <BodyMap sex={sex} view={thumbView(e)} primary={e.primary} secondary={e.secondary} width={40} />
            </View>
            <Pressable style={{ flex: 1 }} onPress={() => router.push(`/exercise/${e.id}`)} testID={`picker-info-${e.id}`}>
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{e.name}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                {e.primary.map(muscleLabel).join(', ')} · {e.equipment}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => onPick(e)}
              disabled={added}
              testID={`picker-add-${i}`}
              style={{ backgroundColor: added ? colors.surfaceAlt : colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 }}
            >
              <Text style={{ color: added ? colors.textMuted : '#fff', fontWeight: '800' }}>{added ? 'Added' : 'Add'}</Text>
            </Pressable>
          </Card>
        );
      })}
    </View>
  );
}

export default function StrengthWorkout() {
  const sex = useBodySex();
  const params = useLocalSearchParams<{ add?: string }>();
  const router = useRouter();
  const toast = useToast();
  const { addStrength } = useStore();
  const [items, setItems] = useState<DraftExercise[]>(() =>
    (params.add ?? '')
      .split(',')
      .filter((id) => exerciseById(id))
      .map((exerciseId) => ({ exerciseId, sets: emptySets() })),
  );
  const [picking, setPicking] = useState(items.length === 0);
  const [startedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const exercises = items.map((i) => exerciseById(i.exerciseId)!);
  const primary = useMemo(() => [...new Set(exercises.flatMap((e) => e.primary))], [exercises]);
  const secondary = useMemo(() => [...new Set(exercises.flatMap((e) => e.secondary))].filter((m) => !primary.includes(m)), [exercises, primary]);
  const doneSets = items.reduce((s, i) => s + i.sets.filter((x) => Number(x.reps) > 0).length, 0);
  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const updateSet = (ei: number, si: number, patch: Partial<DraftSet>) =>
    setItems((list) => list.map((it, i) => (i !== ei ? it : { ...it, sets: it.sets.map((s, j) => (j === si ? { ...s, ...patch } : s)) })));

  const finish = () => {
    const exercisesOut = items
      .map((it) => ({
        exerciseId: it.exerciseId,
        sets: it.sets
          .filter((s) => Number(s.reps) > 0)
          .map((s) => ({ reps: Math.round(Number(s.reps)), kg: s.kg ? Number(s.kg.replace(',', '.')) || null : null })),
      }))
      .filter((e) => e.sets.length);
    if (!exercisesOut.length) return;
    addStrength({ id: uid(), date: todayISO(), createdAt: Date.now(), exercises: exercisesOut });
    toast(`Workout saved · +${XP.strength} XP 💪`);
    router.replace('/body');
  };

  if (picking) {
    return (
      <Screen testID="strength-screen">
        <ExercisePicker
          already={items.map((i) => i.exerciseId)}
          onPick={(e) => setItems((l) => [...l, { exerciseId: e.id, sets: emptySets() }])}
          onClose={() => (items.length ? setPicking(false) : close())}
        />
      </Screen>
    );
  }

  return (
    <Screen testID="strength-screen">
      <Row style={{ justifyContent: 'space-between' }}>
        <Pressable onPress={close} hitSlop={12} testID="strength-cancel">
          <Text style={{ color: colors.textDim, fontSize: 16 }}>Cancel</Text>
        </Pressable>
        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>Strength · {formatDuration(Math.floor((now - startedAt) / 1000))}</Text>
        <Pressable onPress={finish} disabled={!doneSets} hitSlop={12} testID="strength-finish-top">
          <Text style={{ color: doneSets ? colors.primary : colors.textMuted, fontWeight: '800', fontSize: 16 }}>Finish</Text>
        </Pressable>
      </Row>

      <Card style={{ paddingVertical: 14 }} testID="strength-preview">
        <Label>This workout targets</Label>
        <BodyPair sex={sex} primary={primary} secondary={secondary} width={92} />
        <Body style={{ textAlign: 'center', fontSize: 13 }}>{primary.map(muscleLabel).join(' · ') || 'Add exercises to see muscles'}</Body>
      </Card>

      {items.map((it, ei) => {
        const ex = exerciseById(it.exerciseId)!;
        return (
          <Card key={it.exerciseId} testID={`strength-ex-${ei}`}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Pressable onPress={() => router.push(`/exercise/${ex.id}`)} style={{ flex: 1 }}>
                <Text style={{ color: colors.primary, fontSize: 17, fontWeight: '800' }}>{ex.name}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>{ex.primary.map(muscleLabel).join(', ')}</Text>
              </Pressable>
              <Pressable onPress={() => setItems((l) => l.filter((_, i) => i !== ei))} hitSlop={10} testID={`strength-remove-${ei}`}>
                <Text style={{ color: colors.danger, fontWeight: '700' }}>Remove</Text>
              </Pressable>
            </Row>
            <Row style={{ gap: 8 }}>
              <Text style={[st.head, { width: 34 }]}>SET</Text>
              <Text style={[st.head, { flex: 1 }]}>KG</Text>
              <Text style={[st.head, { flex: 1 }]}>REPS</Text>
              <Text style={[st.head, { width: 28 }]}> </Text>
            </Row>
            {it.sets.map((s, si) => {
              const done = Number(s.reps) > 0;
              return (
                <Row key={si} style={{ gap: 8, backgroundColor: done ? colors.success + '14' : 'transparent', borderRadius: 8, paddingVertical: 2 }}>
                  <Text style={{ color: colors.textDim, width: 34, fontWeight: '800', textAlign: 'center' }}>{si + 1}</Text>
                  <TextInput
                    value={s.kg}
                    onChangeText={(kg) => updateSet(ei, si, { kg })}
                    placeholder="—"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="decimal-pad"
                    style={st.cell}
                    testID={`set-${ei}-${si}-kg`}
                    nativeID={`set-${ei}-${si}-kg`}
                  />
                  <TextInput
                    value={s.reps}
                    onChangeText={(reps) => updateSet(ei, si, { reps: reps.replace(/[^0-9]/g, '') })}
                    placeholder="10"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    style={st.cell}
                    testID={`set-${ei}-${si}-reps`}
                    nativeID={`set-${ei}-${si}-reps`}
                  />
                  <Pressable
                    hitSlop={8}
                    onPress={() => (done ? updateSet(ei, si, { reps: '' }) : updateSet(ei, si, { reps: s.reps || '10' }))}
                    testID={`set-${ei}-${si}-done`}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: done ? colors.success : colors.surfaceAlt,
                    }}
                  >
                    <Text style={{ color: done ? '#0B0C0F' : colors.textMuted, fontWeight: '900' }}>✓</Text>
                  </Pressable>
                </Row>
              );
            })}
            <Row style={{ gap: 8 }}>
              <Button
                title="+ Add set"
                variant="secondary"
                style={{ flex: 1, minHeight: 40 }}
                testID={`strength-add-set-${ei}`}
                onPress={() =>
                  setItems((l) => l.map((x, i) => (i === ei ? { ...x, sets: [...x.sets, { ...(x.sets[x.sets.length - 1] ?? { kg: '', reps: '' }) }] } : x)))
                }
              />
              {it.sets.length > 1 ? (
                <Button
                  title="− Set"
                  variant="ghost"
                  style={{ minHeight: 40 }}
                  testID={`strength-remove-set-${ei}`}
                  onPress={() => setItems((l) => l.map((x, i) => (i === ei ? { ...x, sets: x.sets.slice(0, -1) } : x)))}
                />
              ) : null}
            </Row>
          </Card>
        );
      })}

      <Button title="+ Add exercise" variant="secondary" onPress={() => setPicking(true)} testID="strength-add-exercise" />
      <Button
        title={doneSets ? `Finish workout · ${doneSets} sets` : 'Tick or enter reps to finish'}
        onPress={finish}
        disabled={!doneSets}
        testID="strength-finish"
      />
    </Screen>
  );
}

const st = StyleSheet.create({
  head: { color: colors.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 0.8, textAlign: 'center' },
  cell: {
    flex: 1,
    // Web inputs have an intrinsic width; let flex size them instead.
    width: 0,
    minWidth: 0,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 8,
  },
});
