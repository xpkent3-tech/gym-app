import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { Field } from '@/components/Field';
import { useToast } from '@/components/Toast';
import { Body, Button, Card, H1, Label, Row, Screen, Stat } from '@/components/ui';
import { bmi, ffmi, latestEntry, leanMassKg } from '@/lib/bodycomp';
import { formatDate, todayISO } from '@/lib/dates';
import { connectHealth, healthSupported, readHealthSnapshot, type HealthSnapshot } from '@/lib/health';
import { uid } from '@/lib/id';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';

const fmt = (v: number | null | undefined, unit = '') => (v === null || v === undefined ? '—' : `${v}${unit}`);

export default function BodyComposition() {
  const router = useRouter();
  const toast = useToast();
  const { profile, setProfile, bodyLog, addBodyEntry, health, setHealth } = useStore();
  const [weight, setWeight] = useState('');
  const [fat, setFat] = useState('');
  const [syncing, setSyncing] = useState(false);
  if (!profile) return null;
  const latest = latestEntry(bodyLog);
  const height = profile.body?.heightCm || health.snapshot?.heightCm;
  const w = latest?.weightKg ?? profile.body?.weightKg;
  const bf = latest?.bodyFatPct ?? profile.body?.bodyFatPct;
  const history = [...bodyLog].sort((a, b) => (a.date === b.date ? b.createdAt - a.createdAt : a.date < b.date ? 1 : -1));
  const supported = healthSupported();
  const oldest = history[history.length - 1];
  const trend = {
    kg: latest && oldest ? Math.round((latest.weightKg - oldest.weightKg) * 10) / 10 : 0,
    fat: latest?.bodyFatPct !== undefined && oldest?.bodyFatPct !== undefined ? Math.round((latest.bodyFatPct - oldest.bodyFatPct) * 10) / 10 : null,
  };

  const wNum = Number(weight.replace(',', '.'));
  const fNum = fat ? Number(fat.replace(',', '.')) : undefined;
  const valid = wNum > 30 && wNum < 250 && (fNum === undefined || (fNum > 2 && fNum < 60));

  const save = () => {
    addBodyEntry({ id: uid(), date: todayISO(), createdAt: Date.now(), weightKg: wNum, bodyFatPct: fNum, source: 'manual' });
    setWeight('');
    setFat('');
    toast('Weigh-in saved');
  };

  const sync = async (connect: boolean) => {
    setSyncing(true);
    try {
      if (connect && !(await connectHealth())) return toast('Apple Health access was not granted');
      const snap: HealthSnapshot = await readHealthSnapshot();
      setHealth({ connected: true, snapshot: snap, syncedAt: Date.now() });
      if (snap.heightCm && !profile.body?.heightCm)
        setProfile({ ...profile, body: { weightKg: profile.body?.weightKg ?? snap.weightKg ?? 70, ...profile.body, heightCm: snap.heightCm } });
      const already = bodyLog.some((b) => b.source === 'health' && b.date === snap.weightDate && b.weightKg === snap.weightKg);
      if (snap.weightKg && !already) {
        addBodyEntry({
          id: uid(),
          date: snap.weightDate ?? todayISO(),
          createdAt: Date.now(),
          weightKg: snap.weightKg,
          bodyFatPct: snap.bodyFatPct,
          source: 'health',
        });
      }
      toast('Synced with Apple Health');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Screen testID="bodycomp-screen">
      <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} hitSlop={12} testID="bodycomp-back">
        <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '600' }}>‹ Back</Text>
      </Pressable>
      <H1>Body composition</H1>

      <Card testID="bodycomp-latest">
        <Row>
          <Stat label="Weight" value={fmt(w, ' kg')} testID="bodycomp-weight" />
          <Stat label="Body fat" value={fmt(bf, ' %')} testID="bodycomp-fat" />
          <Stat label="Lean mass" value={fmt(w ? leanMassKg(w, bf) : null, ' kg')} testID="bodycomp-lean" />
        </Row>
        <Row style={{ marginTop: 6 }}>
          <Stat label="BMI" value={fmt(w ? bmi(w, height) : null)} testID="bodycomp-bmi" />
          <Stat label="FFMI" value={fmt(w ? ffmi(w, bf, height) : null)} sub="muscle index" testID="bodycomp-ffmi" />
          <Stat label="Height" value={fmt(height, ' cm')} />
        </Row>
        {latest && history.length > 1 ? (
          <Text style={{ color: trend.kg <= 0 ? colors.success : colors.warning, fontWeight: '700' }} testID="bodycomp-trend">
            {trend.kg > 0 ? '+' : ''}
            {trend.kg} kg
            {trend.fat !== null ? ` · ${trend.fat > 0 ? '+' : ''}${trend.fat} % body fat` : ''} since {formatDate(history[history.length - 1].date)}
          </Text>
        ) : null}
        {latest ? <Body style={{ fontSize: 12 }}>Updated {formatDate(latest.date)} · nutrition targets use these numbers.</Body> : null}
      </Card>

      <Card testID="health-card" style={{ borderColor: '#FF2D55' + '66' }}>
        <Row style={{ gap: 10 }}>
          <Text style={{ fontSize: 26 }}>❤️</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontSize: 17, fontWeight: '800' }}>Apple Health</Text>
            <Text style={{ color: colors.textMuted, fontSize: 12 }} testID="health-status">
              {!supported
                ? 'Available on iPhone'
                : health.connected
                  ? `Connected${health.syncedAt ? ` · synced ${new Date(health.syncedAt).toLocaleTimeString()}` : ''}`
                  : 'Not connected'}
            </Text>
          </View>
        </Row>
        {!supported ? (
          <Body testID="health-unsupported">
            Apple Health sync works in the iPhone app: weight, body fat, lean mass, resting heart rate, VO₂max, steps and active energy. Log weigh-ins below in
            the meantime.
          </Body>
        ) : (
          <>
            <Body>Imports weight, body fat %, lean mass and height, plus resting heart rate, VO₂max, steps and active energy.</Body>
            <Button
              title={syncing ? 'Syncing…' : health.connected ? 'Sync now' : 'Connect Apple Health'}
              onPress={() => sync(!health.connected)}
              disabled={syncing}
              testID="health-connect"
            />
            {syncing ? <ActivityIndicator color={colors.primary} /> : null}
          </>
        )}
        {health.snapshot ? (
          <Row style={{ marginTop: 6 }}>
            <Stat label="Resting HR" value={fmt(health.snapshot.restingHr, ' bpm')} />
            <Stat label="VO₂max" value={fmt(health.snapshot.vo2max)} />
            <Stat label="Steps today" value={fmt(health.snapshot.stepsToday)} />
          </Row>
        ) : null}
      </Card>

      <Card>
        <Label>Log a weigh-in</Label>
        <Row style={{ gap: 12 }}>
          <Field label="Weight (kg)" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" placeholder="76.4" testID="bodycomp-input-weight" />
          <Field label="Body fat % (optional)" value={fat} onChangeText={setFat} keyboardType="decimal-pad" placeholder="15" testID="bodycomp-input-fat" />
        </Row>
        <Button title="Save weigh-in" onPress={save} disabled={!valid} testID="bodycomp-save" />
      </Card>

      <Card testID="bodycomp-history">
        <Label>History</Label>
        {history.length === 0 ? <Body>No weigh-ins yet.</Body> : null}
        {history.slice(0, 12).map((b, i) => (
          <Row key={b.id} style={{ justifyContent: 'space-between', paddingVertical: 4 }}>
            <Text style={{ color: colors.textDim }}>
              {formatDate(b.date)} {b.source === 'health' ? '❤️' : ''}
            </Text>
            <Text style={{ color: colors.text, fontWeight: '800' }} testID={`bodycomp-history-${i}`}>
              {b.weightKg} kg{b.bodyFatPct !== undefined ? ` · ${b.bodyFatPct} %` : ''}
            </Text>
          </Row>
        ))}
      </Card>
    </Screen>
  );
}
