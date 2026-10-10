import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { BodyPair } from '@/components/BodyMap';
import { StrengthCard } from '@/components/StrengthCard';
import { intensities } from '@/lib/muscles';
import { useWeeklyMuscles } from '@/lib/useMuscles';
import { ChallengeCard } from '@/components/ChallengeCard';
import { LevelChip } from '@/components/LevelChip';
import { FriendRunCard } from '@/components/FriendRunCard';
import { Segmented } from '@/components/Segmented';

import { RunCard } from '@/components/RunCard';
import { TodayCard } from '@/components/TodayCard';
import { Body, Button, Card, H1, Label, Row, Screen, Stat } from '@/components/ui';
import { friendsFeed, runnerById } from '@/lib/community';
import { addDays, diffDays, todayISO } from '@/lib/dates';
import { formatKm } from '@/lib/pace';
import { prsSetBy } from '@/lib/records';
import { rankRunner } from '@/lib/rank';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';
import { useInvite } from '@/lib/useInvite';
import { useProgress } from '@/lib/useProgress';
import { nextBestAction } from '@/lib/nudges';
import { useBodySex } from '@/lib/useBodySex';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

export default function Home() {
  const sex = useBodySex();
  const { profile, runs, plan, friends, invitesSent, strength } = useStore();
  const muscles = useWeeklyMuscles();
  const heat = useMemo(() => intensities(muscles.load), [muscles]);
  const today = todayISO();
  const [feed, setFeed] = useState<'you' | 'friends'>('you');
  const invite = useInvite();
  const progress = useProgress();
  const nudge = useMemo(
    () => (profile ? nextBestAction({ profile, runs, plan, friends, invitesSent }, today) : null),
    [profile, runs, plan, friends, invitesSent, today],
  );
  const router = useRouter();
  const weekFrom = addDays(today, -6);
  const weekRuns = runs.filter((r) => r.date >= weekFrom);
  const weekKm = weekRuns.reduce((s, r) => s + r.distanceKm, 0);
  const rank = useMemo(() => (profile ? rankRunner(profile, runs) : null), [profile, runs]);
  const daysToRace = profile ? diffDays(today, profile.raceDate) : 0;
  const friendRuns = useMemo(() => (feed === 'friends' ? friendsFeed(friends, today).slice(0, 20) : []), [feed, friends, today]);

  if (!profile) return null;
  return (
    <Screen testID="home-screen">
      <Row style={{ justifyContent: 'space-between' }}>
        <View style={{ gap: 2 }}>
          <Body>{greeting()},</Body>
          <H1 testID="home-greeting">{profile.name} 👟</H1>
          {progress ? <LevelChip level={progress.level.level} streak={progress.streak} /> : null}
        </View>
        <Pressable onPress={() => router.push('/profile')} testID="home-profile" hitSlop={8}>
          <Avatar name={profile.name} color={colors.primary} size={44} />
        </Pressable>
      </Row>

      <Card>
        <Row>
          <Stat label="Last 7 days" value={`${formatKm(weekKm)} km`} testID="home-week-km" />
          <Stat label="Runs" value={String(weekRuns.length)} />
          <Stat label="Race day" value={daysToRace >= 0 ? `${daysToRace}d` : 'Done'} />
        </Row>
      </Card>

      {nudge ? (
        <Card testID="nudge" style={{ borderColor: colors.warning + '88', backgroundColor: '#211A0E' }}>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }} testID="nudge-text">
            {nudge.emoji} {nudge.text}
          </Text>
        </Card>
      ) : null}

      <TodayCard plan={plan} runs={runs} today={today} />

      {progress ? <ChallengeCard challenge={progress.challenge} /> : null}

      <Card onPress={() => router.push('/body')} testID="home-muscles">
        <Row style={{ justifyContent: 'space-between' }}>
          <Label>Muscles this week</Label>
          <Text style={{ color: colors.primary, fontWeight: '700' }}>Open ›</Text>
        </Row>
        <BodyPair sex={sex} heat={heat} width={84} />
      </Card>

      {rank ? (
        <Card onPress={() => router.push('/rank')} testID="home-rank-card" style={{ borderColor: rank.tier.color + '66' }}>
          <Label>Your rank</Label>
          <Text style={{ color: rank.tier.color, fontSize: 26, fontWeight: '900' }}>Top {rank.topPct}%</Text>
          <Body>{rank.tier.name} marathoner · tap for details</Body>
        </Card>
      ) : null}

      <Segmented
        testID="feed"
        value={feed}
        onChange={setFeed}
        options={[
          { value: 'you', label: 'You' },
          { value: 'friends', label: `Friends${friends.length ? ` · ${friends.length}` : ''}` },
        ]}
      />
      {feed === 'friends' ? (
        friends.length === 0 ? (
          <Card testID="feed-empty">
            <Text style={{ color: colors.text, fontSize: 17, fontWeight: '700' }}>Your feed is quiet</Text>
            <Body>Add friends to see their runs here and cheer them on with kudos.</Body>
            <Row style={{ gap: 8 }}>
              <Button title="Find friends" variant="secondary" onPress={() => router.push('/friends')} testID="feed-find" style={{ flex: 1 }} />
              <Button title="Invite" onPress={invite} testID="feed-invite" style={{ flex: 1 }} />
            </Row>
          </Card>
        ) : (
          friendRuns.map((r, i) => <FriendRunCard key={r.id} run={r} runner={runnerById(r.runnerId)!} index={i} />)
        )
      ) : runs.length === 0 && strength.length === 0 ? (
        <Card testID="history-empty">
          <Text style={{ color: colors.text, fontSize: 17, fontWeight: '700' }}>No runs yet</Text>
          <Body>Log your first run to unlock your rank and start your streak.</Body>
          <Button title="Log your first run" onPress={() => router.push('/log')} testID="empty-log" />
        </Card>
      ) : (
        [
          ...runs.map((r) => ({ kind: 'run' as const, date: r.date, at: r.createdAt, run: r })),
          ...strength.map((x) => ({ kind: 'strength' as const, date: x.date, at: x.createdAt, session: x })),
        ]
          .sort((a, b) => (a.date === b.date ? b.at - a.at : a.date < b.date ? 1 : -1))
          .map((item, i) =>
            item.kind === 'run' ? (
              <RunCard key={item.run.id} run={item.run} index={runs.indexOf(item.run)} prs={prsSetBy(item.run, runs)} />
            ) : (
              <StrengthCard key={item.session.id} session={item.session} index={i} />
            ),
          )
      )}
    </Screen>
  );
}
