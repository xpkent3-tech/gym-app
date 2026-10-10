import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ConfirmButton } from '@/components/ConfirmButton';
import { Body, Button, Card, H1, Label, ProgressBar, Row, Screen, Stat } from '@/components/ui';
import { formatDate, todayISO } from '@/lib/dates';
import { formatDuration, formatKm } from '@/lib/pace';
import { personalRecords, RECORD_DISTANCES } from '@/lib/records';
import { useStore } from '@/lib/store';
import { useProgress } from '@/lib/useProgress';
import { weeklyTotals } from '@/lib/history';
import { colors } from '@/lib/theme';

export default function ProfileTab() {
  const { profile, runs, reset } = useStore();
  const router = useRouter();
  const prs = useMemo(() => personalRecords(runs), [runs]);
  const progress = useProgress();
  const [allBadges, setAllBadges] = useState(false);
  const badges = useMemo(() => {
    const sorted = [...(progress?.badges ?? [])].sort((a, b) => Number(b.unlocked) - Number(a.unlocked));
    return allBadges ? sorted : sorted.slice(0, 6);
  }, [progress, allBadges]);
  const history = useMemo(() => weeklyTotals(runs, todayISO()), [runs]);
  const maxWeek = Math.max(10, ...history.map((w) => w.km));
  if (!profile) return null;
  const totalKm = runs.reduce((s, r) => s + r.distanceKm, 0);
  const totalSec = runs.reduce((s, r) => s + r.durationSec, 0);

  return (
    <Screen testID="profile-screen">
      <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} hitSlop={12} testID="profile-back">
        <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '600' }}>‹ Back</Text>
      </Pressable>
      <H1 testID="profile-name">{profile.name}</H1>
      <Body>
        {profile.sex === 'female' ? 'Female' : 'Male'} · {profile.age} · {profile.experience} · race {formatDate(profile.raceDate)}
      </Body>
      {progress ? (
        <Card testID="profile-level">
          <Row style={{ justifyContent: 'space-between' }}>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: '900' }} testID="profile-level-text">
              Level {progress.level.level}
            </Text>
            <Text style={{ color: colors.textDim, fontWeight: '700' }}>
              {progress.level.into} / {progress.level.needed} XP
            </Text>
          </Row>
          <ProgressBar value={progress.level.into / progress.level.needed} />
          <Body style={{ fontSize: 12 }}>
            {progress.xp} XP total · {progress.streak ? `🔥 ${progress.streak}-week streak` : '3 runs this week starts a streak'}
          </Body>
        </Card>
      ) : null}
      <Card testID="profile-history">
        <Label>Weekly distance · last 8 weeks</Label>
        <Row style={{ alignItems: 'flex-end', gap: 6, height: 96 }}>
          {history.map((w) => (
            <View key={w.start} style={{ flex: 1, height: '100%', justifyContent: 'flex-end', alignItems: 'center', gap: 4 }}>
              {w.km > 0 ? <Text style={{ color: colors.textMuted, fontSize: 10 }}>{Math.round(w.km)}</Text> : null}
              <View
                style={{
                  width: '100%',
                  height: `${Math.max(3, (w.km / maxWeek) * 75)}%`,
                  borderRadius: 4,
                  backgroundColor: w.isCurrent ? colors.primary : w.km ? colors.primaryDim : colors.surfaceAlt,
                }}
              />
            </View>
          ))}
        </Row>
        <Row style={{ justifyContent: 'space-between' }}>
          <Text style={{ color: colors.textMuted, fontSize: 11 }}>8 wks ago</Text>
          <Text style={{ color: colors.textMuted, fontSize: 11 }} testID="profile-history-current">
            This week · {formatKm(history[history.length - 1].km)} km
          </Text>
        </Row>
      </Card>
      {progress ? (
        <Card testID="profile-badges">
          <Label>
            Badges · {progress.badges.filter((b) => b.unlocked).length}/{progress.badges.length}
          </Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {badges.map((b) => (
              <View
                key={b.id}
                testID={`badge-${b.id}${b.unlocked ? '-unlocked' : ''}`}
                style={{
                  width: '31%',
                  flexGrow: 1,
                  alignItems: 'center',
                  padding: 10,
                  gap: 4,
                  borderRadius: 14,
                  backgroundColor: b.unlocked ? colors.surfaceAlt : 'transparent',
                  borderWidth: 1,
                  borderColor: b.unlocked ? colors.gold + '55' : colors.border,
                  opacity: b.unlocked ? 1 : 0.55,
                }}
              >
                <Text style={{ fontSize: 26 }}>{b.unlocked ? b.emoji : '🔒'}</Text>
                <Text style={{ color: colors.text, fontWeight: '700', fontSize: 12, textAlign: 'center' }}>{b.title}</Text>
                {!b.unlocked ? <Text style={{ color: colors.textMuted, fontSize: 10, textAlign: 'center' }}>{b.hint}</Text> : null}
              </View>
            ))}
          </View>
          {progress.badges.length > 6 ? (
            <Button
              title={allBadges ? 'Show fewer' : `Show all ${progress.badges.length} badges`}
              variant="ghost"
              onPress={() => setAllBadges(!allBadges)}
              testID="badges-toggle"
            />
          ) : null}
        </Card>
      ) : null}
      <Card>
        <Row>
          <Stat label="Total km" value={formatKm(totalKm)} testID="profile-total-km" />
          <Stat label="Runs" value={String(runs.length)} />
          <Stat label="Time" value={formatDuration(totalSec)} />
        </Row>
      </Card>
      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <Label>Friend code</Label>
          <Text style={{ color: colors.text, fontWeight: '800', letterSpacing: 1 }} testID="profile-code">
            {profile.friendCode}
          </Text>
        </Row>
      </Card>
      <Card testID="profile-prs">
        <Label>Personal records</Label>
        {RECORD_DISTANCES.map((d) => {
          const pr = prs.find((p) => p.key === d.key);
          return (
            <Row key={d.key} style={{ justifyContent: 'space-between', paddingVertical: 6 }}>
              <Text style={{ color: colors.text, fontWeight: '700' }}>{d.label}</Text>
              <Text style={{ color: pr ? colors.gold : colors.textMuted, fontWeight: '800' }} testID={`pr-${d.key}`}>
                {pr ? formatDuration(pr.timeSec) : '—'}
              </Text>
            </Row>
          );
        })}
      </Card>
      <ConfirmButton
        title="Reset all data"
        confirmTitle="Erase everything"
        message="This permanently deletes your profile, plan and every run on this device."
        testID="profile-reset"
        onConfirm={() => {
          reset();
          router.replace('/onboarding');
        }}
      />
    </Screen>
  );
}
