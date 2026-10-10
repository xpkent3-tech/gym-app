import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';

import { Field } from '@/components/Field';
import { Segmented } from '@/components/Segmented';
import { useToast } from '@/components/Toast';
import { Body, Button, Card, Chip, H1, Label, Row, Screen } from '@/components/ui';
import { todayISO } from '@/lib/dates';
import { estimateFromPhoto, estimateFromText, foodAIEnabled, type Estimate } from '@/lib/foodAI';
import { uid } from '@/lib/id';
import { itemFor, MEALS, scaleItem, searchFoods, totals, type FoodItem, type FoodSource, type Meal } from '@/lib/nutrition';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';

type Mode = 'snap' | 'describe' | 'search' | 'quick';

function guessMeal(): Meal {
  const h = new Date().getHours();
  return h < 11 ? 'breakfast' : h < 15 ? 'lunch' : h < 21 ? 'dinner' : 'snacks';
}

export default function AddFood() {
  const params = useLocalSearchParams<{ meal?: Meal; date?: string }>();
  const router = useRouter();
  const toast = useToast();
  const { addFood } = useStore();
  const [meal, setMeal] = useState<Meal>(params.meal ?? guessMeal());
  const [mode, setMode] = useState<Mode>(foodAIEnabled() ? 'snap' : 'describe');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');
  const [quick, setQuick] = useState({ name: '', kcal: '', protein: '', carbs: '', fat: '' });
  const [review, setReview] = useState<{ items: FoodItem[]; source: FoodSource; estimate?: Estimate } | null>(null);
  const close = () => (router.canGoBack() ? router.back() : router.replace('/food'));

  const snap = async (camera: boolean) => {
    setError(null);
    if (!foodAIEnabled()) return;
    if (camera) {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) return setError('Camera permission is needed to snap your meal.');
    }
    const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], base64: true, quality: 0.6, allowsEditing: false };
    const result = camera ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
    if (result.canceled || !result.assets?.[0]?.base64) return;
    setPhoto(result.assets[0].uri);
    setBusy(true);
    try {
      const est = await estimateFromPhoto(result.assets[0].base64, text.trim() || undefined);
      if (!est.items.length) setError(est.notes || 'No food found in that photo.');
      else setReview({ items: est.items, source: 'photo', estimate: est });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const describe = async () => {
    setError(null);
    setBusy(true);
    try {
      const est = await estimateFromText(text);
      if (!est.items.length) setError(`Couldn’t recognise “${text}”. Try simpler names, or use Quick add.`);
      else setReview({ items: est.items, source: 'text', estimate: est });
    } finally {
      setBusy(false);
    }
  };

  const save = () => {
    if (!review?.items.length) return;
    addFood({ id: uid(), date: params.date ?? todayISO(), createdAt: Date.now(), meal, source: review.source, items: review.items });
    toast(`Added ${totals(review.items).kcal} kcal to ${MEALS.find((m) => m.id === meal)!.label.toLowerCase()}`);
    close();
  };

  if (review) {
    const t = totals(review.items);
    return (
      <Screen testID="food-review">
        <Row style={{ justifyContent: 'space-between' }}>
          <Pressable onPress={() => setReview(null)} hitSlop={12} testID="review-back">
            <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '600' }}>‹ Edit</Text>
          </Pressable>
          <Pressable onPress={save} hitSlop={12} testID="review-save-top">
            <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '800' }}>Save</Text>
          </Pressable>
        </Row>
        <H1>Review</H1>
        {photo ? <Image source={{ uri: photo }} style={{ width: '100%', height: 180, borderRadius: 16 }} resizeMode="cover" /> : null}
        <Card style={{ alignItems: 'center' }}>
          <Text style={{ color: colors.text, fontSize: 36, fontWeight: '900' }} testID="review-kcal">
            {t.kcal} kcal
          </Text>
          <Body>
            P {Math.round(t.protein)} g · C {Math.round(t.carbs)} g · F {Math.round(t.fat)} g
          </Body>
          {review.estimate?.source === 'ai' ? (
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>
              AI estimate · {review.estimate.confidence} confidence{review.estimate.notes ? ` · ${review.estimate.notes}` : ''}
            </Text>
          ) : null}
          {review.estimate?.unmatched.length ? (
            <Text style={{ color: colors.warning, fontSize: 12 }} testID="review-unmatched">
              Not found: {review.estimate.unmatched.join(', ')}
            </Text>
          ) : null}
        </Card>
        {review.items.map((it, i) => (
          <Card key={i} testID={`review-item-${i}`}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Text style={{ color: colors.text, fontWeight: '800', flex: 1 }} testID={`review-item-${i}-name`}>
                {it.name}
              </Text>
              <Text style={{ color: colors.textDim, fontWeight: '800' }} testID={`review-item-${i}-kcal`}>
                {it.kcal} kcal
              </Text>
            </Row>
            <Row style={{ gap: 8 }}>
              {[0.5, 0.75, 1.25, 1.5].map((k) => (
                <Chip
                  key={k}
                  label={`×${k}`}
                  onPress={() => setReview({ ...review, items: review.items.map((x, j) => (j === i ? scaleItem(x, x.grams * k) : x)) })}
                  testID={`review-item-${i}-x${k}`}
                />
              ))}
            </Row>
            <Row style={{ justifyContent: 'space-between' }}>
              <Text style={{ color: colors.textMuted }}>
                {it.grams} g · P {Math.round(it.protein)} · C {Math.round(it.carbs)} · F {Math.round(it.fat)}
              </Text>
              <Pressable onPress={() => setReview({ ...review, items: review.items.filter((_, j) => j !== i) })} hitSlop={8} testID={`review-item-${i}-remove`}>
                <Text style={{ color: colors.danger, fontWeight: '700' }}>Remove</Text>
              </Pressable>
            </Row>
          </Card>
        ))}
        <Button title={`Add to ${MEALS.find((m) => m.id === meal)!.label}`} onPress={save} disabled={!review.items.length} testID="review-save" />
      </Screen>
    );
  }

  const results = searchFoods(query);
  const q = { kcal: Number(quick.kcal), p: Number(quick.protein) || 0, c: Number(quick.carbs) || 0, f: Number(quick.fat) || 0 };

  return (
    <Screen testID="food-add">
      <Row style={{ justifyContent: 'space-between' }}>
        <Pressable onPress={close} hitSlop={12} testID="food-add-cancel">
          <Text style={{ color: colors.textDim, fontSize: 16 }}>Cancel</Text>
        </Pressable>
        <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>Log food</Text>
        <View style={{ width: 50 }} />
      </Row>
      <Row style={{ gap: 6, flexWrap: 'wrap' }}>
        {MEALS.map((m) => (
          <Chip key={m.id} label={`${m.emoji} ${m.label}`} selected={meal === m.id} onPress={() => setMeal(m.id)} testID={`add-meal-${m.id}`} />
        ))}
      </Row>
      <Segmented
        testID="food-mode"
        value={mode}
        onChange={(m) => {
          setMode(m);
          setError(null);
        }}
        options={[
          { value: 'snap', label: '📸 Snap' },
          { value: 'describe', label: '✍️ Describe' },
          { value: 'search', label: '🔍 Search' },
          { value: 'quick', label: '⚡ Quick' },
        ]}
      />

      {mode === 'snap' ? (
        foodAIEnabled() ? (
          <Card style={{ alignItems: 'center', gap: 12, paddingVertical: 28 }}>
            <Text style={{ fontSize: 44 }}>📸</Text>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>Snap your meal</Text>
            <Body style={{ textAlign: 'center' }}>AI identifies each food and estimates portions, calories and macros. You review before saving.</Body>
            <Button title="Take photo" onPress={() => snap(true)} testID="snap-camera" style={{ alignSelf: 'stretch' }} />
            <Button title="Choose from library" variant="secondary" onPress={() => snap(false)} testID="snap-library" style={{ alignSelf: 'stretch' }} />
            <Field
              label="Add context (optional)"
              value={text}
              onChangeText={setText}
              placeholder="e.g. cooked in olive oil, large bowl"
              testID="snap-context"
            />
          </Card>
        ) : (
          <Card testID="snap-unavailable" style={{ gap: 10 }}>
            <Text style={{ color: colors.text, fontSize: 17, fontWeight: '800' }}>Photo AI isn’t set up</Text>
            <Body>
              Snap-to-log needs the Stride food AI service (server/food-ai). Until it’s connected, describe your meal and we’ll estimate it on your phone.
            </Body>
            <Button title="✍️  Describe instead" onPress={() => setMode('describe')} testID="snap-describe-instead" />
          </Card>
        )
      ) : null}

      {mode === 'describe' ? (
        <Card>
          <Field
            label="What did you eat?"
            value={text}
            onChangeText={setText}
            placeholder="2 eggs, 2 slices of toast and a banana"
            multiline
            style={{ minHeight: 80 }}
            testID="describe-input"
          />
          <Button title={busy ? 'Estimating…' : 'Estimate calories'} onPress={describe} disabled={!text.trim() || busy} testID="describe-go" />
          <Body style={{ fontSize: 12 }}>{foodAIEnabled() ? 'Uses AI for accuracy.' : 'Estimated on your phone from Stride’s food database.'}</Body>
        </Card>
      ) : null}

      {mode === 'search' ? (
        <Card>
          <Field label="Search foods" value={query} onChangeText={setQuery} placeholder="chicken, oats, banana…" autoCapitalize="none" testID="search-food" />
          {query.trim() && !results.length ? <Body>No match. Try Describe or Quick add.</Body> : null}
          {results.map((f, i) => (
            <Row key={f.id} style={{ gap: 8, paddingVertical: 6, borderTopWidth: 1, borderTopColor: colors.border }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: '700' }}>{f.name}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                  {f.kcal} kcal / 100 g · 1 {f.unit} = {f.unitGrams} g
                </Text>
              </View>
              <Pressable
                onPress={() => setReview({ items: [itemFor(f, f.unitGrams)], source: 'search' })}
                testID={`search-food-${i}-unit`}
                style={{ backgroundColor: colors.surfaceAlt, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}
              >
                <Text style={{ color: colors.text, fontWeight: '700' }}>1 {f.unit}</Text>
              </Pressable>
              <Pressable
                onPress={() => setReview({ items: [itemFor(f, 100)], source: 'search' })}
                testID={`search-food-${i}-100g`}
                style={{ backgroundColor: colors.surfaceAlt, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}
              >
                <Text style={{ color: colors.text, fontWeight: '700' }}>100 g</Text>
              </Pressable>
            </Row>
          ))}
        </Card>
      ) : null}

      {mode === 'quick' ? (
        <Card>
          <Field label="Name" value={quick.name} onChangeText={(name) => setQuick({ ...quick, name })} placeholder="Restaurant pasta" testID="quick-name" />
          <Field
            label="Calories"
            value={quick.kcal}
            onChangeText={(kcal) => setQuick({ ...quick, kcal: kcal.replace(/[^0-9]/g, '') })}
            keyboardType="number-pad"
            placeholder="650"
            testID="quick-kcal"
          />
          <Row style={{ gap: 8 }}>
            <Field
              label="Protein g"
              value={quick.protein}
              onChangeText={(protein) => setQuick({ ...quick, protein })}
              keyboardType="decimal-pad"
              testID="quick-protein"
            />
            <Field
              label="Carbs g"
              value={quick.carbs}
              onChangeText={(carbs) => setQuick({ ...quick, carbs })}
              keyboardType="decimal-pad"
              testID="quick-carbs"
            />
            <Field label="Fat g" value={quick.fat} onChangeText={(fat) => setQuick({ ...quick, fat })} keyboardType="decimal-pad" testID="quick-fat" />
          </Row>
          <Button
            title="Review"
            disabled={!(q.kcal > 0)}
            testID="quick-go"
            onPress={() =>
              setReview({ items: [{ name: quick.name.trim() || 'Quick add', grams: 100, kcal: q.kcal, protein: q.p, carbs: q.c, fat: q.f }], source: 'manual' })
            }
          />
        </Card>
      ) : null}

      {busy ? (
        <Row style={{ gap: 10, justifyContent: 'center' }}>
          <ActivityIndicator color={colors.primary} />
          <Label>Analysing…</Label>
        </Row>
      ) : null}
      {error ? (
        <Body style={{ color: colors.danger }} testID="food-error">
          {error}
        </Body>
      ) : null}
    </Screen>
  );
}
