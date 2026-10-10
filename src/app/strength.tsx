import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { BodyPair } from '@/components/BodyMap';
import { ExercisePicker } from '@/components/ExercisePicker';
import { RestBar } from '@/components/RestBar';
import { useToast } from '@/components/Toast';
import { Body, Button, Card, Label, Row, Screen } from '@/components/ui';
import { todayISO } from '@/lib/dates';
import { exerciseById } from '@/lib/exercises';
import { uid } from '@/lib/id';
import { muscleLabel, type SetType } from '@/lib/muscles';
import { formatDuration } from '@/lib/pace';
import { entryPrs, exerciseHistory, formatSet, SET_TYPES } from '@/lib/strength';
import { useStore } from '@/lib/store';
import { colors, radius } from '@/lib/theme';
import { useBodySex } from '@/lib/useBodySex';

interface DraftSet {
  kg: string;
  reps: string;
  type: SetType;
  done: boolean;
}
interface DraftExercise {
  exerciseId: string;
  sets: DraftSet[];
  note: string;
  restSec: number;
}

const clock = () => Date.now();
const DEFAULT_REST = 90;
const REST_OPTIONS = [0, 30, 60, 90, 120, 180, 300];
const restLabel = (s: number) => (s === 0 ? 'Off' : s % 60 === 0 ? `${s / 60}min` : s > 60 ? `${Math.floor(s / 60)}min ${s % 60}s` : `${s}s`);
const blankSet = (): DraftSet => ({ kg: '', reps: '', type: 'normal', done: false });
const newExercise = (exerciseId: string, sets = 3, restSec = DEFAULT_REST): DraftExercise => ({
  exerciseId,
  sets: Array.from({ length: sets }, blankSet),
  note: '',
  restSec,
});
const badge = (type: SetType) => SET_TYPES.find((t) => t.id === type)!.badge;
const badgeColor = (type: SetType) => ({ normal: colors.textDim, warmup: colors.warning, drop: '#B77CFF', failure: colors.danger })[type];

export default function StrengthWorkout() {
  const sex = useBodySex();
  const params = useLocalSearchParams<{ add?: string; routine?: string }>();
  const router = useRouter();
  const toast = useToast();
  const { addStrength, strength, routines } = useStore();
  const [items, setItems] = useState<DraftExercise[]>(() => {
    const routine = routines.find((r) => r.id === params.routine);
    if (routine) return routine.exercises.filter((e) => exerciseById(e.exerciseId)).map((e) => newExercise(e.exerciseId, e.sets, e.restSec ?? DEFAULT_REST));
    return (params.add ?? '')
      .split(',')
      .filter((id) => exerciseById(id))
      .map((id) => newExercise(id));
  });
  const [picking, setPicking] = useState(items.length === 0);
  const [typeMenu, setTypeMenu] = useState<string | null>(null);
  const [startedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const [rest, setRest] = useState<{ end: number; total: number } | null>(null);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const exercises = items.map((i) => exerciseById(i.exerciseId)!);
  const primary = useMemo(() => [...new Set(exercises.flatMap((e) => e.primary))], [exercises]);
  const secondary = useMemo(() => [...new Set(exercises.flatMap((e) => e.secondary))].filter((m) => !primary.includes(m)), [exercises, primary]);
  const doneSets = items.flatMap((i) => i.sets.filter((s) => s.done && Number(s.reps) > 0));
  const working = doneSets.filter((s) => s.type !== 'warmup');
  const volume = working.reduce((v, s) => v + (Number(s.kg.replace(',', '.')) || 0) * Number(s.reps), 0);
  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const remaining = rest ? Math.max(0, Math.ceil((rest.end - now) / 1000)) : 0;

  const patchExercise = (ei: number, patch: Partial<DraftExercise>) => setItems((l) => l.map((x, i) => (i === ei ? { ...x, ...patch } : x)));
  const updateSet = (ei: number, si: number, patch: Partial<DraftSet>) =>
    setItems((list) => list.map((it, i) => (i !== ei ? it : { ...it, sets: it.sets.map((s, j) => (j === si ? { ...s, ...patch } : s)) })));

  const toggleDone = (ei: number, si: number) => {
    const it = items[ei];
    const s = it.sets[si];
    if (s.done) return updateSet(ei, si, { done: false });
    const prevSet = previousFor(ei)[si];
    const kg = s.kg || (prevSet?.kg ? String(prevSet.kg) : '');
    const reps = s.reps || (prevSet ? String(prevSet.reps) : '10');
    updateSet(ei, si, { kg, reps, done: true });
    // Live PR toast, compared with every saved session.
    const hist = exerciseHistory(strength, it.exerciseId);
    const kgN = Number(kg.replace(',', '.')) || null;
    if (s.type !== 'warmup' && entryPrs({ exerciseId: it.exerciseId, sets: [{ kg: kgN, reps: Number(reps) }] }, hist).length) {
      toast(`New PR 🏆 ${exerciseById(it.exerciseId)?.name}`);
    }
    if (it.restSec > 0) setRest({ end: clock() + it.restSec * 1000, total: it.restSec });
  };

  const previousFor = (ei: number) => {
    const h = exerciseHistory(strength, items[ei].exerciseId);
    return h.length ? h[h.length - 1].entry.sets.filter((x) => x.reps > 0) : [];
  };

  const finish = () => {
    const exercisesOut = items
      .map((it) => ({
        exerciseId: it.exerciseId,
        restSec: it.restSec,
        ...(it.note.trim() ? { note: it.note.trim() } : {}),
        sets: it.sets
          .filter((s) => s.done && Number(s.reps) > 0)
          .map((s) => ({
            reps: Math.round(Number(s.reps)),
            kg: s.kg ? Number(s.kg.replace(',', '.')) || null : null,
            ...(s.type !== 'normal' ? { type: s.type } : {}),
          })),
      }))
      .filter((e) => e.sets.length);
    if (!exercisesOut.length) return;
    const id = uid();
    addStrength({ id, date: todayISO(), createdAt: Date.now(), durationSec: Math.floor((Date.now() - startedAt) / 1000), exercises: exercisesOut });
    router.replace({ pathname: '/workout/[id]', params: { id, fresh: '1' } });
  };

  if (picking) {
    return (
      <Screen testID="strength-screen">
        <ExercisePicker
          already={items.map((i) => i.exerciseId)}
          onPick={(e) => setItems((l) => [...l, newExercise(e.id)])}
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
        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>Log workout</Text>
        <Pressable onPress={finish} disabled={!doneSets.length} hitSlop={12} testID="strength-finish-top">
          <Text style={{ color: doneSets.length ? colors.primary : colors.textMuted, fontWeight: '800', fontSize: 16 }}>Finish</Text>
        </Pressable>
      </Row>

      <Row style={{ gap: 8 }}>
        {[
          ['Time', formatDuration(Math.floor((now - startedAt) / 1000)), 'stat-time'],
          ['Volume', `${Math.round(volume)} kg`, 'stat-volume'],
          ['Sets', String(working.length), 'stat-sets'],
        ].map(([label, value, id]) => (
          <View key={id} style={st.stat}>
            <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '700' }}>{label}</Text>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }} testID={id}>
              {value}
            </Text>
          </View>
        ))}
      </Row>

      {rest ? (
        <RestBar
          remaining={remaining}
          total={rest.total}
          onAdjust={(d) => setRest({ end: rest.end + d * 1000, total: Math.max(1, rest.total + d) })}
          onSkip={() => setRest(null)}
        />
      ) : null}

      <Card style={{ paddingVertical: 14 }} testID="strength-preview">
        <Label>This workout targets</Label>
        <BodyPair sex={sex} primary={primary} secondary={secondary} width={92} />
        <Body style={{ textAlign: 'center', fontSize: 13 }}>{primary.map(muscleLabel).join(' · ') || 'Add exercises to see muscles'}</Body>
      </Card>

      {items.map((it, ei) => {
        const ex = exerciseById(it.exerciseId)!;
        const prev = previousFor(ei);
        let normalIdx = 0;
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
            <TextInput
              value={it.note}
              onChangeText={(note) => patchExercise(ei, { note })}
              placeholder="Add notes here..."
              placeholderTextColor={colors.textMuted}
              style={st.note}
              testID={`ex-${ei}-note`}
              nativeID={`ex-${ei}-note`}
            />
            <Pressable
              onPress={() => patchExercise(ei, { restSec: REST_OPTIONS[(REST_OPTIONS.indexOf(it.restSec) + 1) % REST_OPTIONS.length] })}
              testID={`ex-${ei}-rest`}
              hitSlop={6}
            >
              <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }} testID={`ex-${ei}-rest-label`}>
                ⏱ Rest Timer: {restLabel(it.restSec)}
              </Text>
            </Pressable>
            <Row style={{ gap: 8 }}>
              <Text style={[st.head, { width: 34 }]}>SET</Text>
              <Text style={[st.head, { flex: 1.3 }]}>PREVIOUS</Text>
              <Text style={[st.head, { flex: 1 }]}>KG</Text>
              <Text style={[st.head, { flex: 1 }]}>REPS</Text>
              <Text style={[st.head, { width: 28 }]}> </Text>
            </Row>
            {it.sets.map((s, si) => {
              const label = s.type === 'normal' ? String(++normalIdx) : badge(s.type);
              const p = prev[si];
              const menuKey = `${ei}-${si}`;
              return (
                <View key={si} style={{ gap: 6 }}>
                  <Row style={{ gap: 8, backgroundColor: s.done ? colors.success + '22' : 'transparent', borderRadius: 8, paddingVertical: 2 }}>
                    <Pressable
                      onPress={() => setTypeMenu(typeMenu === menuKey ? null : menuKey)}
                      style={{ width: 34, alignItems: 'center' }}
                      testID={`set-${ei}-${si}-type`}
                      hitSlop={6}
                    >
                      <Text style={{ color: badgeColor(s.type), fontWeight: '900' }} testID={`set-${ei}-${si}-label`}>
                        {label}
                      </Text>
                    </Pressable>
                    <Pressable
                      style={{ flex: 1.3, alignItems: 'center' }}
                      disabled={!p}
                      onPress={() => p && updateSet(ei, si, { kg: p.kg ? String(p.kg) : '', reps: String(p.reps) })}
                      testID={`set-${ei}-${si}-prev`}
                    >
                      <Text style={{ color: colors.textMuted, fontSize: 13 }}>{p ? formatSet(p) : '—'}</Text>
                    </Pressable>
                    <TextInput
                      value={s.kg}
                      onChangeText={(kg) => updateSet(ei, si, { kg })}
                      placeholder={p?.kg ? String(p.kg) : '—'}
                      placeholderTextColor={colors.textMuted}
                      keyboardType="decimal-pad"
                      style={st.cell}
                      testID={`set-${ei}-${si}-kg`}
                      nativeID={`set-${ei}-${si}-kg`}
                    />
                    <TextInput
                      value={s.reps}
                      onChangeText={(reps) => updateSet(ei, si, { reps: reps.replace(/[^0-9]/g, '') })}
                      placeholder={p ? String(p.reps) : '10'}
                      placeholderTextColor={colors.textMuted}
                      keyboardType="number-pad"
                      style={st.cell}
                      testID={`set-${ei}-${si}-reps`}
                      nativeID={`set-${ei}-${si}-reps`}
                    />
                    <Pressable
                      hitSlop={8}
                      onPress={() => toggleDone(ei, si)}
                      testID={`set-${ei}-${si}-done`}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: s.done ? colors.success : colors.surfaceAlt,
                      }}
                    >
                      <Text style={{ color: s.done ? '#0B0C0F' : colors.textMuted, fontWeight: '900' }}>✓</Text>
                    </Pressable>
                  </Row>
                  {typeMenu === menuKey ? (
                    <Row style={{ gap: 6, flexWrap: 'wrap' }}>
                      {SET_TYPES.map((t) => (
                        <Pressable
                          key={t.id}
                          testID={`settype-${t.id}`}
                          onPress={() => {
                            updateSet(ei, si, { type: t.id });
                            setTypeMenu(null);
                          }}
                          style={[st.typeChip, s.type === t.id && { borderColor: colors.primary, backgroundColor: colors.primary + '22' }]}
                        >
                          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>{t.badge ? `${t.badge} · ${t.label}` : t.label}</Text>
                        </Pressable>
                      ))}
                    </Row>
                  ) : null}
                </View>
              );
            })}
            <Row style={{ gap: 8 }}>
              <Button
                title="+ Add Set"
                variant="secondary"
                style={{ flex: 1, minHeight: 40 }}
                testID={`strength-add-set-${ei}`}
                onPress={() => patchExercise(ei, { sets: [...it.sets, { ...blankSet(), type: 'normal' }] })}
              />
              {it.sets.length > 1 ? (
                <Button
                  title="− Set"
                  variant="ghost"
                  style={{ minHeight: 40 }}
                  testID={`strength-remove-set-${ei}`}
                  onPress={() => patchExercise(ei, { sets: it.sets.slice(0, -1) })}
                />
              ) : null}
            </Row>
          </Card>
        );
      })}

      <Button title="+ Add Exercise" variant="secondary" onPress={() => setPicking(true)} testID="strength-add-exercise" />
      <Button
        title={doneSets.length ? `Finish workout · ${working.length} sets` : 'Tick sets done to finish'}
        onPress={finish}
        disabled={!doneSets.length}
        testID="strength-finish"
      />
    </Screen>
  );
}

const st = StyleSheet.create({
  stat: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 10, gap: 2 },
  head: { color: colors.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 0.8, textAlign: 'center' },
  note: { color: colors.text, fontSize: 14, paddingVertical: 6, width: '100%' },
  typeChip: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
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
