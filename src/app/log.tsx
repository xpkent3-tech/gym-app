import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Field } from '@/components/Field';
import { Body, Button, Card, Chip, H1, Label, Row, Screen } from '@/components/ui';
import { addDays, todayISO } from '@/lib/dates';
import { uid } from '@/lib/id';
import { formatPace, parseDistance, parseDuration } from '@/lib/pace';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';
import { RUN_TYPES, type RunType } from '@/lib/types';

export default function LogRun() {
  const params = useLocalSearchParams<{ type?: RunType; distance?: string; duration?: string; notes?: string }>();
  const router = useRouter();
  const { addRun } = useStore();
  const [type, setType] = useState<RunType>(params.type ?? 'easy');
  const [distance, setDistance] = useState(params.distance ?? '');
  const [duration, setDuration] = useState(params.duration ?? '');
  const [effort, setEffort] = useState(5);
  const [dayOffset, setDayOffset] = useState(0);
  const [notes, setNotes] = useState(params.notes ?? '');

  const km = parseDistance(distance);
  const sec = parseDuration(duration);
  const valid = km !== null && sec !== null;
  const hint = !distance
    ? 'Enter a distance'
    : km === null
      ? 'Distance must be above 0'
      : !duration
        ? 'Enter a time'
        : sec === null
          ? 'Time should look like 45:00 or 1:30:00'
          : null;

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const save = () => {
    if (!valid) return;
    const id = uid();
    addRun({ id, date: addDays(todayISO(), -dayOffset), createdAt: Date.now(), type, distanceKm: km, durationSec: sec, effort, notes: notes.trim() });
    router.replace({ pathname: '/run/[id]', params: { id, fresh: '1' } });
  };

  return (
    <Screen testID="log-screen">
      <Row style={{ justifyContent: 'space-between' }}>
        <Pressable onPress={close} testID="log-cancel" hitSlop={12}>
          <Text style={{ color: colors.textDim, fontSize: 16 }}>Cancel</Text>
        </Pressable>
        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>Log Run</Text>
        <Pressable onPress={save} disabled={!valid} testID="log-save-top" hitSlop={12}>
          <Text style={{ color: valid ? colors.primary : colors.textMuted, fontWeight: '700', fontSize: 16 }}>Save</Text>
        </Pressable>
      </Row>

      {!params.duration ? (
        <Button
          title="⏱  Start live run"
          variant="secondary"
          testID="log-start-live"
          onPress={() => router.replace({ pathname: '/live', params: { type, ...(distance ? { distance } : {}) } })}
        />
      ) : null}

      <Card>
        <Label>Run type</Label>
        <Row style={{ gap: 8, flexWrap: 'wrap' }}>
          {RUN_TYPES.map((t) => (
            <Chip key={t.type} label={t.label} color={t.color} selected={type === t.type} onPress={() => setType(t.type)} testID={`type-${t.type}`} />
          ))}
        </Row>
        <Row style={{ gap: 8, marginTop: 4 }}>
          {['Today', 'Yesterday'].map((d, i) => (
            <Chip key={d} label={d} selected={dayOffset === i} onPress={() => setDayOffset(i)} testID={`day-${i}`} />
          ))}
        </Row>
      </Card>

      <Card>
        <Row style={{ gap: 12, alignItems: 'flex-start' }}>
          <Field label="Distance (km)" value={distance} onChangeText={setDistance} keyboardType="decimal-pad" placeholder="10" testID="log-distance" />
          <Field label="Time" value={duration} onChangeText={setDuration} placeholder="50:00" testID="log-duration" />
        </Row>
        <View style={{ alignItems: 'center', paddingVertical: 8 }}>
          <Text style={{ color: valid ? colors.text : colors.textMuted, fontSize: 40, fontWeight: '900' }} testID="log-pace">
            {valid ? formatPace(sec / km) : '–:––'}
          </Text>
          <Label>avg pace / km</Label>
        </View>
        {hint ? <Body testID="log-hint">{hint}</Body> : null}
      </Card>

      <Card>
        <Label>Effort · {effort}/10</Label>
        <Row style={{ gap: 4 }}>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <Pressable
              key={n}
              onPress={() => setEffort(n)}
              testID={`effort-${n}`}
              style={{
                flex: 1,
                height: 38,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: n <= effort ? (n > 7 ? colors.danger : n > 4 ? colors.warning : colors.success) : colors.surfaceAlt,
              }}
            >
              <Text style={{ color: n <= effort ? '#111' : colors.textDim, fontWeight: '800' }}>{n}</Text>
            </Pressable>
          ))}
        </Row>
        <Field label="Notes" value={notes} onChangeText={setNotes} placeholder="How did it feel?" multiline testID="log-notes" style={{ minHeight: 70 }} />
      </Card>

      <Button title="Save run" onPress={save} disabled={!valid} testID="log-save" />
    </Screen>
  );
}
