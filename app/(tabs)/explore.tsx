import React, { useMemo, useRef, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Animated,
} from 'react-native';
import { useSelector } from 'react-redux';
import { ThemeContext } from '../../components/ThemeContext';

// ── Animated progress bar ────────────────────────────────────────
function AnimBar({ pct, color, height = 8 }: { pct: number; color: string; height?: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: pct, duration: 900, useNativeDriver: false }).start();
  }, [pct]);
  const w = anim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });
  return (
    <View style={[barS.track, { height }]}>
      <Animated.View style={[barS.fill, { width: w, backgroundColor: color }]} />
    </View>
  );
}
const barS = StyleSheet.create({
  track: { backgroundColor: '#E8F5E9', borderRadius: 99, overflow: 'hidden', flex: 1 },
  fill: { height: '100%', borderRadius: 99 },
});

// ── Vertical bar chart ───────────────────────────────────────────
function BarChart({ data, color }: { data: { label: string; value: number }[]; color: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  const anims = useRef(data.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(80, anims.map((a, i) =>
      Animated.timing(a, { toValue: data[i].value / max, duration: 700, useNativeDriver: false })
    )).start();
  }, []);

  return (
    <View style={chartS.wrap}>
      {data.map((d, i) => (
        <View key={d.label} style={chartS.col}>
          <Text style={[chartS.topVal, { color }]}>{d.value}</Text>
          <View style={chartS.barWrap}>
            <Animated.View style={[
              chartS.bar,
              {
                height: anims[i].interpolate({ inputRange: [0, 1], outputRange: [4, 100] }),
                backgroundColor: color,
              }
            ]} />
          </View>
          <Text style={chartS.bottomLabel} numberOfLines={1}>{d.label}</Text>
        </View>
      ))}
    </View>
  );
}
const chartS = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 130, paddingTop: 20 },
  col: { flex: 1, alignItems: 'center', gap: 4 },
  barWrap: { width: '60%', height: 100, justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 6 },
  topVal: { fontSize: 10, fontWeight: '700' },
  bottomLabel: { fontSize: 10, color: '#A5D6A7', marginTop: 4, maxWidth: 36, textAlign: 'center' },
});

// ── Ring ─────────────────────────────────────────────────────────
function Ring({ pct, size = 110, color }: { pct: number; size?: number; color: string }) {
  const stroke = size * 0.14;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{
        width: size, height: size, borderRadius: size / 2,
        borderWidth: stroke, borderColor: '#E8F5E9', position: 'absolute',
      }} />
      <View style={{
        width: size, height: size, borderRadius: size / 2,
        borderWidth: stroke, borderColor: color,
        borderRightColor: pct > 75 ? color : 'transparent',
        borderBottomColor: pct > 50 ? color : 'transparent',
        borderLeftColor: pct > 25 ? color : 'transparent',
        position: 'absolute',
        transform: [{ rotate: '-90deg' }],
      }} />
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: size * 0.22, fontWeight: '800', color: '#1B5E20' }}>{pct}%</Text>
        <Text style={{ fontSize: size * 0.1, color: '#81C784', fontWeight: '600' }}>done</Text>
      </View>
    </View>
  );
}

// ── Stat pill ────────────────────────────────────────────────────
function Pill({ icon, label, value, color }: { icon: string; label: string; value: string | number; color: string }) {
  return (
    <View style={[pillS.wrap, { borderLeftColor: color }]}>
      <Text style={pillS.icon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={pillS.label}>{label}</Text>
        <Text style={[pillS.value, { color }]}>{value}</Text>
      </View>
    </View>
  );
}
const pillS = StyleSheet.create({
  wrap: {
    backgroundColor: 'white', borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderLeftWidth: 4, marginBottom: 10,
    elevation: 2, shadowColor: '#2E7D32', shadowOpacity: 0.07, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  icon: { fontSize: 28 },
  label: { fontSize: 12, color: '#A5D6A7', fontWeight: '600', letterSpacing: 0.3 },
  value: { fontSize: 20, fontWeight: '800', marginTop: 1 },
});

// ── Section header ───────────────────────────────────────────────
function SectionHead({ title, color }: { title: string; color: string }) {
  return <Text style={[secS.title, { color }]}>{title}</Text>;
}
const secS = StyleSheet.create({
  title: { fontSize: 13, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12, marginTop: 8 },
});

// ── Main screen ──────────────────────────────────────────────────
export default function InsightsScreen() {
  const themeContext = useContext(ThemeContext);
  const habits = useSelector((state: any) => state.habits.habits);

  const stats = useMemo(() => {
    const total = habits.length;
    const bloomed = habits.filter((h: any) => h.streak >= h.duration).length;
    const growing = habits.filter((h: any) => h.streak > 0 && h.streak < h.duration).length;
    const seedling = total - bloomed - growing;
    const bestStreak = total > 0 ? Math.max(...habits.map((h: any) => h.streak)) : 0;
    const totalDays = habits.reduce((s: number, h: any) => s + (h.streak || 0), 0);
    const avgProgress = total > 0
      ? Math.round((habits.reduce((s: number, h: any) => s + Math.min(h.streak / h.duration, 1), 0) / total) * 100)
      : 0;
    const longestGoal = total > 0 ? Math.max(...habits.map((h: any) => h.duration)) : 0;
    return { total, bloomed, growing, seedling, bestStreak, totalDays, avgProgress, longestGoal };
  }, [habits]);

  const barData = useMemo(() =>
    [...habits]
      .sort((a: any, b: any) => b.streak - a.streak)
      .slice(0, 6)
      .map((h: any) => ({ label: h.name.slice(0, 6), value: h.streak || 0 })),
    [habits]
  );

  if (!themeContext) return null;
  const { selectedTheme } = themeContext;
  const primary = selectedTheme.primary;

  if (habits.length === 0) {
    return (
      <View style={[styles.emptyWrap, { backgroundColor: selectedTheme.bg }]}>
        <Text style={{ fontSize: 64 }}>📊</Text>
        <Text style={[styles.emptyTitle, { color: primary }]}>No data yet</Text>
        <Text style={styles.emptySub}>Add habits and start streaks to see your statistics here.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: selectedTheme.bg }]}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Page header ── */}
      <View style={styles.pageHeader}>
        <View>
          <Text style={[styles.pageTitle, { color: primary }]}>Garden Stats</Text>
          <Text style={[styles.pageSub, { color: selectedTheme.textContrast }]}>Your growth at a glance</Text>
        </View>
        <Text style={{ fontSize: 40 }}>📊</Text>
      </View>

      {/* ── Overview ring + counts ── */}
      <View style={styles.overviewCard}>
        <Ring pct={stats.avgProgress} size={110} color={primary} />
        <Text style={{ fontSize: 10, color: '#A5D6A7', textAlign: 'left', marginTop: 4 }}>
          {'<-'}Avg Prog
        </Text>
        <View style={styles.overviewRight}>
          <View style={styles.overviewStat}>
            <Text style={[styles.overviewVal, { color: primary }]}>{stats.total}</Text>
            <Text style={styles.overviewLabel}>Total habits</Text>
          </View>
          <View style={styles.overviewDivider} />
          <View style={styles.overviewStat}>
            <Text style={[styles.overviewVal, { color: '#FFD700' }]}>{stats.bloomed}</Text>
            <Text style={styles.overviewLabel}>Fully bloomed 🌸</Text>
          </View>
          <View style={styles.overviewDivider} />
          <View style={styles.overviewStat}>
            <Text style={[styles.overviewVal, { color: '#42A5F5' }]}>{stats.growing}</Text>
            <Text style={styles.overviewLabel}>Growing 🌿</Text>
          </View>
        </View>
      </View>

      {/* ── Key stats pills ── */}
      <SectionHead title="Key Numbers" color={primary} />
      <Pill icon="🔥" label="Best streak" value={`${stats.bestStreak} days`} color="#FF7043" />

      <Pill icon="🎯" label="Longest goal" value={`${stats.longestGoal} days`} color="#AB47BC" />

      {/* ── Bar chart ── */}
      {barData.length > 0 && (
        <View style={styles.card}>
          <SectionHead title="Streak Leaderboard" color={primary} />
          <BarChart data={barData} color={primary} />
        </View>
      )}

      {/* ── Status breakdown — no dormant ── */}
      <View style={styles.card}>
        <SectionHead title="Status Breakdown" color={primary} />
        <View style={styles.breakdownRow}>
          {[
            { label: 'Bloomed', val: stats.bloomed, color: '#FFD700', emoji: '🌸' },
            { label: 'Growing', val: stats.growing, color: primary, emoji: '🌿' },
            { label: 'Seedling', val: stats.seedling, color: '#81C784', emoji: '🌱' },
          ].map(s => (
            <View key={s.label} style={styles.breakdownItem}>
              <Text style={{ fontSize: 28 }}>{s.emoji}</Text>
              <Text style={[styles.breakdownVal, { color: s.color }]}>{s.val}</Text>
              <Text style={styles.breakdownLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 },

  pageHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 24,
  },
  pageTitle: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  pageSub: { fontSize: 14, marginTop: 2, fontWeight: '500' },

  overviewCard: {
    backgroundColor: 'white', borderRadius: 24, padding: 20,
    flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 24,
    elevation: 3, shadowColor: '#2E7D32', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
  },
  overviewRight: { flex: 1, gap: 8 },
  overviewStat: { alignItems: 'flex-start' },
  overviewVal: { fontSize: 26, fontWeight: '800' },
  overviewLabel: { fontSize: 11, color: '#A5D6A7', fontWeight: '600', letterSpacing: 0.3 },
  overviewDivider: { height: 1, backgroundColor: '#F1F8E9' },

  card: {
    backgroundColor: 'white', borderRadius: 20, padding: 20, marginBottom: 16,
    elevation: 2, shadowColor: '#2E7D32', shadowOpacity: 0.07, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
  },

  breakdownRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 },
  breakdownItem: { alignItems: 'center', gap: 4 },
  breakdownVal: { fontSize: 28, fontWeight: '800' },
  breakdownLabel: { fontSize: 11, color: '#A5D6A7', fontWeight: '600' },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 22, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#A5D6A7', textAlign: 'center', lineHeight: 22 },
});