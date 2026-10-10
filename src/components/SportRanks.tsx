import { useRouter } from 'expo-router';
import { Text } from 'react-native';

import { Body, Card, Label, Row } from '@/components/ui';
import { formatDuration } from '@/lib/pace';
import { tierFor } from '@/lib/rank';
import { hybridTopPct, type SportRanks } from '@/lib/sportRank';
import { sportMeta, type SessionSport, type SportId } from '@/lib/sports';
import { colors } from '@/lib/theme';

function RankRow({ title, pct, sub, testID }: { title: string; pct: number; sub: string; testID: string }) {
  return (
    <Row style={{ justifyContent: 'space-between', paddingVertical: 6 }}>
      <Text style={{ color: colors.text, fontWeight: '700', flex: 1 }}>{title}</Text>
      <Text style={{ color: colors.textMuted, marginRight: 12 }}>{sub}</Text>
      <Text style={{ color: tierFor(pct).color, fontWeight: '900', width: 76, textAlign: 'right' }} testID={testID}>
        Top {pct}%
      </Text>
    </Row>
  );
}

export function SportRankCards({ ranks, runningPct, sports }: { ranks: SportRanks; runningPct: number | null; sports: SportId[] }) {
  const router = useRouter();
  const cf = ranks.crossfit[0]?.topPct ?? null;
  const hybrid = hybridTopPct([runningPct, ranks.hyrox?.topPct, cf, ranks.football?.topPct]);
  const unranked = (['hyrox', 'crossfit', 'football'] as SessionSport[]).filter(
    (s) => sports.includes(s) && !(s === 'hyrox' ? ranks.hyrox : s === 'crossfit' ? ranks.crossfit.length : ranks.football),
  );
  const hasAny = ranks.hyrox || ranks.crossfit.length || ranks.football;

  return (
    <>
      {hybrid !== null ? (
        <Card style={{ alignItems: 'center', borderColor: tierFor(hybrid).color, paddingVertical: 20 }} testID="hybrid-rank">
          <Label>Hybrid athlete rank</Label>
          <Text style={{ color: tierFor(hybrid).color, fontSize: 48, fontWeight: '900' }} testID="hybrid-rank-pct">
            Top {hybrid}%
          </Text>
          <Body style={{ textAlign: 'center' }}>Average of your sport ranks — get better everywhere to climb.</Body>
        </Card>
      ) : null}
      {hasAny ? (
        <Card testID="sport-ranks">
          <Label>Sport ranks</Label>
          {runningPct !== null ? <RankRow title="🏃 Marathon" pct={runningPct} sub="predicted" testID="sport-rank-running" /> : null}
          {ranks.hyrox ? <RankRow title="🔥 HYROX Open" pct={ranks.hyrox.topPct} sub={formatDuration(ranks.hyrox.bestSec)} testID="sport-rank-hyrox" /> : null}
          {ranks.crossfit.map((b) => (
            <RankRow
              key={b.benchmark}
              title={`⚡ ${b.label}`}
              pct={b.topPct}
              sub={b.result.resultSec ? formatDuration(b.result.resultSec) : `${b.result.rounds} rds`}
              testID={`sport-rank-${b.benchmark}`}
            />
          ))}
          {ranks.football ? (
            <RankRow title="⚽ Football load" pct={ranks.football.topPct} sub={`${ranks.football.weeklyAU} AU/wk`} testID="sport-rank-football" />
          ) : null}
        </Card>
      ) : null}
      {unranked.map((s) => {
        const m = sportMeta(s);
        const how =
          s === 'hyrox'
            ? 'Log a HYROX race or simulation'
            : s === 'crossfit'
              ? 'Log a benchmark WOD (Fran, Grace, Helen, Cindy, Murph)'
              : 'Log a match or training';
        return (
          <Card key={s} onPress={() => router.push({ pathname: '/sport/[sport]', params: { sport: s } })} testID={`sport-unranked-${s}`}>
            <Text style={{ color: colors.text, fontWeight: '800' }}>
              {m.emoji} {m.label} · unranked
            </Text>
            <Body>{how} to get your rank.</Body>
          </Card>
        );
      })}
    </>
  );
}
