import { useRouter } from 'expo-router';
import { useMemo, useState, type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Field } from '@/components/Field';
import { useToast } from '@/components/Toast';
import { Body, Button, Card, H1, Label, Row, Screen } from '@/components/ui';
import { normalizeCode, runnerActivity, runnerByCode, runnerById, runnerTopPct, searchRunners, suggestedRunners, type Runner } from '@/lib/community';
import { todayISO } from '@/lib/dates';
import { formatKm } from '@/lib/pace';
import { rankRunner, tierFor } from '@/lib/rank';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';
import { useInvite } from '@/lib/useInvite';

function RunnerRow({ runner, action, testID, sub }: { runner: Runner; action?: ReactNode; testID: string; sub: string }) {
  const router = useRouter();
  const pct = runnerTopPct(runner);
  return (
    <Pressable
      onPress={() => router.push(`/friend/${runner.id}`)}
      testID={testID}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 }}
    >
      <Avatar name={runner.name} color={runner.color} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{runner.name}</Text>
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>
          @{runner.handle} · {sub}
        </Text>
      </View>
      {action ?? <Text style={{ color: tierFor(pct).color, fontWeight: '800' }}>Top {pct}%</Text>}
    </Pressable>
  );
}

export default function Friends() {
  const router = useRouter();
  const { profile, runs, friends, addFriend, invitesSent } = useStore();
  const toast = useToast();
  const invite = useInvite();
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | undefined>();
  const [query, setQuery] = useState('');
  const today = todayISO();
  const myPct = useMemo(() => (profile ? (rankRunner(profile, runs)?.topPct ?? null) : null), [profile, runs]);
  const suggestions = useMemo(() => suggestedRunners(friends, myPct, 4), [friends, myPct]);
  const results = useMemo(() => searchRunners(query).slice(0, 6), [query]);
  if (!profile) return null;

  const add = (r: Runner) => {
    addFriend(r.id);
    toast(`Added ${r.name.split(' ')[0]} 🤝`);
  };

  const addByCode = () => {
    const normalized = normalizeCode(code);
    if (normalized === profile.friendCode) return setCodeError("That's your own code");
    const r = runnerByCode(normalized);
    if (!r) return setCodeError('No runner found with that code');
    if (friends.includes(r.id)) return setCodeError(`${r.name} is already your friend`);
    setCodeError(undefined);
    setCode('');
    add(r);
  };

  const addButton = (r: Runner, testID: string) =>
    friends.includes(r.id) ? (
      <Text style={{ color: colors.success, fontWeight: '700' }}>Friends ✓</Text>
    ) : (
      <Pressable
        onPress={() => add(r)}
        testID={testID}
        hitSlop={8}
        style={{ backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 }}
      >
        <Text style={{ color: '#fff', fontWeight: '800' }}>Add</Text>
      </Pressable>
    );

  const weekKm = (r: Runner) => runnerActivity(r, today, 7).reduce((s, x) => s + x.distanceKm, 0);

  return (
    <Screen testID="friends-screen">
      <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} hitSlop={12} testID="friends-back">
        <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '600' }}>‹ Back</Text>
      </Pressable>
      <H1>Friends</H1>

      <Card style={{ borderColor: colors.primary + '66' }}>
        <Label>Your friend code</Label>
        <Text style={{ color: colors.text, fontSize: 28, fontWeight: '900', letterSpacing: 2 }} testID="friends-my-code">
          {profile.friendCode}
        </Text>
        <Body>Runners who train with friends are far more likely to make it to race day. Invite yours.</Body>
        <Button title="Invite friends" onPress={invite} testID="friends-invite" />
        {invitesSent > 0 ? (
          <Body style={{ fontSize: 12 }}>
            {invitesSent} invite{invitesSent === 1 ? '' : 's'} sent
          </Body>
        ) : null}
      </Card>

      <Card>
        <Label>Add by code</Label>
        <Row style={{ gap: 8, alignItems: 'flex-start' }}>
          <Field
            label="Friend code"
            value={code}
            onChangeText={(t) => {
              setCode(t);
              setCodeError(undefined);
            }}
            placeholder="STR-XXXXXX"
            autoCapitalize="characters"
            testID="friends-code-input"
            error={codeError}
          />
          <Button title="Add" onPress={addByCode} disabled={!code.trim()} testID="friends-code-add" style={{ marginTop: 22 }} />
        </Row>
      </Card>

      <Card>
        <Field label="Find runners" value={query} onChangeText={setQuery} placeholder="Search name or @handle" testID="friends-search" autoCapitalize="none" />
        {query.trim() && results.length === 0 ? <Body>No runners match “{query}”.</Body> : null}
        {results.map((r, i) => (
          <RunnerRow key={r.id} runner={r} sub={r.city} testID={`search-result-${i}`} action={addButton(r, `search-add-${i}`)} />
        ))}
      </Card>

      <Card testID="friends-list">
        <Label>Your friends · {friends.length}</Label>
        {friends.length === 0 ? (
          <View style={{ gap: 8 }} testID="friends-empty">
            <Text style={{ color: colors.text, fontSize: 17, fontWeight: '700' }}>Training is better together</Text>
            <Body>Add a suggested runner below or invite someone you know.</Body>
          </View>
        ) : (
          friends
            .map(runnerById)
            .filter((r): r is Runner => !!r)
            .map((r, i) => <RunnerRow key={r.id} runner={r} sub={`${formatKm(weekKm(r))} km this week`} testID={`friend-row-${i}`} />)
        )}
      </Card>

      {suggestions.length ? (
        <Card>
          <Label>Suggested · runners at your level</Label>
          {suggestions.map((r, i) => (
            <RunnerRow
              key={r.id}
              runner={r}
              sub={`Top ${runnerTopPct(r)}% · ${r.city}`}
              testID={`suggested-${i}`}
              action={addButton(r, `suggested-add-${i}`)}
            />
          ))}
        </Card>
      ) : null}
    </Screen>
  );
}
