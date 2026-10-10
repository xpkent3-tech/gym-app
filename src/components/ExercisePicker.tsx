import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { BodyMap, type BodyView } from '@/components/BodyMap';
import { Field } from '@/components/Field';
import { Body, Card, Chip, H1, Row } from '@/components/ui';
import { searchExercises, type Exercise } from '@/lib/exercises';
import { muscleLabel, type MuscleId } from '@/lib/muscles';
import { colors } from '@/lib/theme';
import { useBodySex } from '@/lib/useBodySex';

const BACK_MUSCLES: MuscleId[] = ['glutes', 'hamstrings', 'lats', 'upperBack', 'lowerBack', 'triceps', 'calves'];
export const thumbView = (e: Exercise): BodyView => (e.primary.some((m) => BACK_MUSCLES.includes(m)) ? 'back' : 'front');
export const FILTERS: MuscleId[] = ['glutes', 'hamstrings', 'quads', 'calves', 'abs', 'obliques', 'hipFlexors', 'adductors', 'tibialis', 'upperBack', 'chest'];

/** Searchable exercise list. `onPick` adds to a workout/routine; omit it for a browse-only library. */
export function ExercisePicker({
  onPick,
  onClose,
  already = [],
  title = 'Add exercise',
  closeLabel = 'Done',
}: {
  onPick?: (e: Exercise) => void;
  onClose: () => void;
  already?: string[];
  title?: string;
  closeLabel?: string;
}) {
  const sex = useBodySex();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [muscle, setMuscle] = useState<MuscleId | null>(null);
  const list = searchExercises(query, muscle);
  return (
    <View style={{ gap: 12 }} testID="picker">
      <Row style={{ justifyContent: 'space-between' }}>
        <H1>{title}</H1>
        <Pressable onPress={onClose} hitSlop={10} testID="picker-close">
          <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 16 }}>{closeLabel}</Text>
        </Pressable>
      </Row>
      <Field label="Search" value={query} onChangeText={setQuery} placeholder="e.g. squat" testID="picker-search" autoCapitalize="none" />
      <Row style={{ gap: 6, flexWrap: 'wrap' }}>
        <Chip label="All muscles" selected={!muscle} onPress={() => setMuscle(null)} testID="filter-all" />
        {FILTERS.map((m) => (
          <Chip key={m} label={muscleLabel(m)} selected={muscle === m} onPress={() => setMuscle(muscle === m ? null : m)} testID={`filter-${m}`} />
        ))}
      </Row>
      <Pressable onPress={() => router.push('/exercise/new')} testID="picker-create">
        <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 15 }}>+ Create custom exercise</Text>
      </Pressable>
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
                {e.custom ? ' · Custom' : ''}
              </Text>
            </Pressable>
            {onPick ? (
              <Pressable
                onPress={() => onPick(e)}
                disabled={added}
                testID={`picker-add-${i}`}
                style={{ backgroundColor: added ? colors.surfaceAlt : colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 }}
              >
                <Text style={{ color: added ? colors.textMuted : '#fff', fontWeight: '800' }}>{added ? 'Added' : 'Add'}</Text>
              </Pressable>
            ) : null}
          </Card>
        );
      })}
    </View>
  );
}
