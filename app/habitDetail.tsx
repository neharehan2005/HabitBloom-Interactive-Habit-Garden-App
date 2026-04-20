import {
  View, Text, StyleSheet, Pressable, ScrollView, Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { useContext, useRef, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeContext } from '../components/ThemeContext';

export default function HabitDetail() {
  // ── All hooks first ──────────────────────────────────────────
  const themeContext = useContext(ThemeContext);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const habits = useSelector((state: any) => state.habits.habits);

  // Animations
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;
  const barWidth = useRef(new Animated.Value(0)).current;
  const plantScale = useRef(new Animated.Value(0.6)).current;
  const plantRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, useNativeDriver: true }),
      Animated.spring(plantScale, { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.sequence([
        Animated.timing(plantRotate, { toValue: -0.04, duration: 200, useNativeDriver: true }),
        Animated.timing(plantRotate, { toValue: 0.04, duration: 200, useNativeDriver: true }),
        Animated.timing(plantRotate, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  if (!themeContext) return null;
  const { selectedTheme } = themeContext;
  const primary = selectedTheme.primary;

  const habit = habits.find((h: any) => h.id === String(id));
  console.log("Route ID:", id);
  console.log("All habits:", habits);

  if (!habit) {
    return (
      <LinearGradient colors={[primary, '#40916C']} style={styles.centered}>
        <Text style={styles.notFound}>No habit found 🪴</Text>
      </LinearGradient>
    );
  }

  // ── Logic completely unchanged ───────────────────────────────
  const progress = Math.min(Math.round((habit.streak / habit.duration) * 100), 100);

  const getPlantStage = () => {
    if (progress >= 100) return { emoji: '🌸', label: 'Fully Bloomed', color: '#FF6B9D' };
    if (progress >= 75) return { emoji: '🌳', label: 'Thriving', color: '#52B788' };
    if (progress >= 50) return { emoji: '🌿', label: 'Growing', color: '#74C69D' };
    return { emoji: '🌱', label: 'Sprouting', color: '#95D5B2' };
  };

  const getStatus = () => {
    if (habit.streak >= habit.duration)
      return { label: 'Goal Achieved', emoji: '🏆', colors: ['#F9A825', '#FF6F00'] as const };
    if (progress >= 60)
      return { label: 'On Track', emoji: '🚀', colors: [primary, '#1B4332'] as const };
    return { label: 'Keep Growing', emoji: '💪', colors: ['#E63946', '#C1121F'] as const };
  };

  const plant = getPlantStage();
  const status = getStatus();

  const timeline = Array.from(
    { length: Math.min(habit.duration, 14) },
    (_, i) => i < habit.streak
  );

  // Animate bar to progress value after mount
  Animated.timing(barWidth, {
    toValue: progress,
    duration: 1000,
    delay: 400,
    useNativeDriver: false,
  }).start();

  const plantSpin = plantRotate.interpolate({ inputRange: [-1, 1], outputRange: ['-30deg', '30deg'] });

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: selectedTheme.bg }]}
      showsVerticalScrollIndicator={false}
    >
      {/* ─── HERO HEADER ─── */}
      <LinearGradient
        colors={[primary + 'DD', primary, '#40916C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.blob1} />
        <View style={styles.blob2} />

        {/* Back arrow */}
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backArrow, pressed && { opacity: 0.6 }]}
        >
          <Text style={styles.backArrowText}>←</Text>
        </Pressable>

        {/* Animated plant avatar */}
        <Animated.View style={[
          styles.avatarRing,
          { transform: [{ scale: plantScale }, { rotate: plantSpin }] }
        ]}>
          <View style={styles.avatarInner}>
            <Text style={styles.plantEmoji}>{plant.emoji}</Text>
          </View>
        </Animated.View>

        {/* Stage pill */}
        <View style={[styles.stagePill, { backgroundColor: plant.color + '30' }]}>
          <View style={[styles.stageDot, { backgroundColor: plant.color }]} />
          <Text style={[styles.stageText, { color: plant.color }]}>{plant.label}</Text>
        </View>

        <Text style={styles.title}>{habit.name}</Text>
        <Text style={styles.subtitle}>Habit Journey</Text>
      </LinearGradient>

      {/* ─── BODY ─── */}
      <Animated.View style={[styles.body, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>

        {/* ── PROGRESS CARD ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: primary + '22' }]}>
              <Text style={{ fontSize: 16 }}>🌱</Text>
            </View>
            <Text style={[styles.cardTitle, { color: primary }]}>Growth Progress</Text>
            <Text style={[styles.pctBadge, { color: primary }]}>{progress}%</Text>
          </View>

          {/* Animated progress bar */}
          <View style={styles.track}>
            <Animated.View style={[
              styles.fill,
              {
                width: barWidth.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
                backgroundColor: primary,
              }
            ]} />
          </View>

          <View style={styles.progressFooter}>
            <Text style={styles.progressNote}>{habit.streak} of {habit.duration} days complete</Text>
            <Text style={styles.progressNote}>{Math.max(habit.duration - habit.streak, 0)} days left</Text>
          </View>
        </View>

        {/* ── STATS ROW ── */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#FFF8E1' }]}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={[styles.statNum, { color: '#E65100' }]}>{habit.streak}</Text>
            <Text style={styles.statLbl}>Day Streak</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#FFF8E1' }]}>
            <Text style={styles.statEmoji}>🎯</Text>
            <Text style={[styles.statNum, { color: primary }]}>{habit.duration}</Text>
            <Text style={styles.statLbl}>Day Goal</Text>
          </View>
        </View>

        {/* ── CONSISTENCY TRAIL ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: '#FFF3E0' }]}>
              <Text style={{ fontSize: 16 }}>🌼</Text>
            </View>
            <Text style={[styles.cardTitle, { color: primary }]}>Consistency Trail</Text>
          </View>

          <View style={styles.dotGrid}>
            {timeline.map((filled, i) =>
              filled ? (
                <View key={i} style={[styles.dotFilled, { backgroundColor: primary }]}>
                  <Text style={styles.dotTick}>✓</Text>
                </View>
              ) : (
                <View key={i} style={styles.dotEmpty} />
              )
            )}
          </View>

          <View style={styles.legend}>
            <View style={styles.legendRow}>
              <View style={[styles.legendSwatch, { backgroundColor: primary }]} />
              <Text style={styles.legendLbl}>Completed</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendSwatch, { backgroundColor: '#E9ECEF', borderWidth: 1, borderColor: '#CED4DA' }]} />
              <Text style={styles.legendLbl}>Remaining</Text>
            </View>
          </View>
        </View>

        {/* ── STATUS CARD ── */}
        <LinearGradient
          colors={status.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.statusCard}
        >
          <Text style={styles.statusEmoji}>{status.emoji}</Text>
          <Text style={styles.statusLabel}>{status.label}</Text>
        </LinearGradient>

        {/* ── BACK BUTTON ── */}
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
        >
          <LinearGradient
            colors={[primary, '#40916C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.backBtn}
          >
            <Text style={styles.backText}>← Back to Garden</Text>
          </LinearGradient>
        </Pressable>

      </Animated.View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFound: { color: '#fff', fontSize: 16 },

  header: {
    paddingTop: 60, paddingBottom: 40, paddingHorizontal: 24,
    alignItems: 'center', overflow: 'hidden', position: 'relative',
  },
  blob1: {
    position: 'absolute', width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.1)', top: -70, right: -60,
  },
  blob2: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.07)', bottom: -50, left: -40,
  },

  backArrow: {
    position: 'absolute', top: 52, left: 20,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  backArrowText: { color: '#fff', fontSize: 20, fontWeight: '700' },

  avatarRing: {
    width: 120, height: 120, borderRadius: 60,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  avatarInner: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    elevation: 8,
    shadowColor: '#000', shadowOpacity: 0.2,
    shadowRadius: 12, shadowOffset: { width: 0, height: 6 },
  },
  plantEmoji: { fontSize: 50 },

  stagePill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 30, paddingHorizontal: 14, paddingVertical: 5,
    marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  stageDot: { width: 7, height: 7, borderRadius: 4 },
  stageText: { fontSize: 11, letterSpacing: 2, fontWeight: '700', textTransform: 'uppercase' },

  title: {
    fontSize: 28, fontWeight: '800', color: '#fff',
    textAlign: 'center', letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 12, color: 'rgba(255,255,255,0.65)',
    letterSpacing: 3, textTransform: 'uppercase', marginTop: 4,
  },

  body: { paddingHorizontal: 20, paddingTop: 24 },

  card: {
    backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 16,
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.07,
    shadowRadius: 16, shadowOffset: { width: 0, height: 6 },
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  cardIcon: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: '700', letterSpacing: 0.2 },
  pctBadge: { fontSize: 18, fontWeight: '800' },

  track: {
    width: '100%', height: 12, borderRadius: 8,
    backgroundColor: '#E9ECEF', overflow: 'hidden', marginBottom: 10,
  },
  fill: { height: '100%', borderRadius: 8 },
  progressFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  progressNote: { fontSize: 12, color: '#6C757D' },

  statsRow: { flexDirection: 'row', gap: 14, marginBottom: 16 },
  statCard: {
    flex: 1, borderRadius: 22, padding: 20, alignItems: 'center',
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.07,
    shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
  },
  statEmoji: { fontSize: 26, marginBottom: 6 },
  statNum: { fontSize: 32, fontWeight: '800', lineHeight: 36 },
  statLbl: {
    fontSize: 11, color: '#6C757D',
    letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: '600', marginTop: 4,
  },

  dotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  dotFilled: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  dotTick: { color: '#fff', fontSize: 14, fontWeight: '800' },
  dotEmpty: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#F1F3F5', borderWidth: 1.5, borderColor: '#DEE2E6',
  },
  legend: { flexDirection: 'row', gap: 20 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSwatch: { width: 12, height: 12, borderRadius: 4 },
  legendLbl: { fontSize: 12, color: '#6C757D' },

  statusCard: {
    borderRadius: 22, paddingVertical: 18,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 10, marginBottom: 16,
    elevation: 5, shadowColor: '#000', shadowOpacity: 0.15,
    shadowRadius: 12, shadowOffset: { width: 0, height: 5 },
  },
  statusEmoji: { fontSize: 22 },
  statusLabel: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },

  backBtn: {
    borderRadius: 40, paddingVertical: 16, alignItems: 'center',
    elevation: 5, shadowColor: '#000', shadowOpacity: 0.2,
    shadowRadius: 12, shadowOffset: { width: 0, height: 5 },
  },
  backText: { color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: 0.5 },
});