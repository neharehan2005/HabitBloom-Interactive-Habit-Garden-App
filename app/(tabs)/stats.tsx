import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';

const { width } = Dimensions.get('window');

// 🎨 NEW COLORS
const COLORS = {
  bg: '#FFF6F2',
  card: '#FFFFFF',
  primary: '#F4511E',
  green: '#2E7D32',
  lightGreen: '#66BB6A',
  paleGreen: '#E8F5E9',
  textDark: '#1B1B1B',
  textLight: '#777',
};

const STREAK_COLORS = [
  '#E8F5E9',
  '#C8E6C9',
  '#A5D6A7',
  '#66BB6A',
  '#2E7D32',
];

// ─── Animated Bar ─────────────────────────────────────────
const AnimatedBar = ({ value, day, maxValue, index }) => {
  const heightAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const isTop = value === maxValue;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(heightAnim, {
        toValue: value,
        delay: index * 80,
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const barHeight = heightAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 120],
  });

  return (
    <Animated.View style={[styles.barWrapper, { opacity: opacityAnim }]}>
      <Text style={styles.barPercent}>{value}%</Text>

      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, { height: barHeight }]}>
          <LinearGradient
            colors={
              isTop
                ? ['#66BB6A', '#2E7D32']
                : ['#A5D6A7', '#66BB6A']
            }
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>

      <Text style={styles.barDay}>{day}</Text>
    </Animated.View>
  );
};

// ─── Heat Map ─────────────────────────────────────────────
const HeatMapGrid = ({ data }) => (
  <View style={styles.heatGrid}>
    {data.map((item, idx) => (
      <View
        key={idx}
        style={[
          styles.heatCell,
          { backgroundColor: STREAK_COLORS[item.intensity] },
        ]}
      />
    ))}
  </View>
);

// ─── Stat Card ────────────────────────────────────────────
const StatCard = ({ label, value, unit, accent, delay }) => {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, delay, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.statCard,
        { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <View style={[styles.statAccent, { backgroundColor: accent }]} />
      <Text style={styles.statValue}>
        {value}
        <Text style={styles.statUnit}>{unit}</Text>
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
};

// ─── MAIN SCREEN ──────────────────────────────────────────
export default function StatisticsScreen() {
  const habits = useSelector((state) => state.habits.habits);

  const gardenHealth =
    habits.length > 0
      ? Math.round(
          (habits.reduce((acc, h) => acc + (h.streak / h.duration), 0) /
            habits.length) *
            100
        )
      : 0;

  const currentStreak = Math.max(...habits.map(h => h.streak), 0);

  const completedHabits = habits.filter(h => h.streak >= h.duration).length;

  const weeklyData = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => ({
    day,
    value:
      habits.length > 0
        ? Math.round(
            (habits.filter(h => h.streak > 0).length / habits.length) * 100
          )
        : 0
  }));

  const maxValue = Math.max(...weeklyData.map(d => d.value), 0);

  const heatmapData = Array.from({ length: 35 }, (_, i) => ({
    day: i,
    intensity:
      habits.length === 0
        ? 0
        : Math.min(
            4,
            Math.floor(
              habits.reduce((acc, h) => acc + h.streak, 0) / habits.length / 2
            )
          ),
  }));

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.header}>📊 Statistics</Text>

        {/* Stat Cards */}
        <View style={styles.statRow}>
          <StatCard label="Garden Health" value={gardenHealth} unit="%" accent="#66BB6A" />
          <StatCard label="Best Streak" value={currentStreak} unit="d" accent="#FFA726" />
          <StatCard label="Completed" value={completedHabits} unit="" accent="#42A5F5" />
        </View>

        {/* Weekly */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Weekly Completion</Text>
          <View style={styles.barChart}>
            {weeklyData.map((item, idx) => (
              <AnimatedBar key={idx} {...item} maxValue={maxValue} index={idx} />
            ))}
          </View>
        </View>

        {/* Heatmap */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Monthly Activity</Text>
          <HeatMapGrid data={heatmapData} />
        </View>

        {/* Health */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Overall Progress</Text>
          <View style={styles.healthTrack}>
            <View style={[styles.healthFill, { width: `${gardenHealth}%` }]} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 20, paddingTop: 60 },

  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 20,
  },

  statRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },

  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 10,
  },

  statAccent: { height: 3, borderRadius: 2, marginBottom: 5 },

  statValue: {
    fontSize: 20,
    color: COLORS.textDark,
    fontWeight: 'bold',
  },

  statUnit: { fontSize: 12, color: COLORS.green },

  statLabel: { fontSize: 10, color: COLORS.textLight },

  card: {
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
  },

  cardTitle: {
    color: COLORS.textDark,
    marginBottom: 10,
    fontWeight: 'bold',
  },

  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 150,
  },

  barWrapper: { alignItems: 'center', flex: 1 },

  barPercent: { fontSize: 10, color: COLORS.textLight },

  barTrack: {
    width: 20,
    height: 100,
    backgroundColor: COLORS.paleGreen,
    borderRadius: 6,
    justifyContent: 'flex-end',
  },

  barFill: { width: '100%', borderRadius: 6 },

  barDay: { fontSize: 10, color: COLORS.textLight },

  heatGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },

  heatCell: {
    width: (width - 60) / 7,
    height: (width - 60) / 7,
    borderRadius: 4,
  },

  healthTrack: {
    height: 10,
    backgroundColor: COLORS.paleGreen,
    borderRadius: 5,
    overflow: 'hidden',
  },

  healthFill: {
    height: '100%',
    backgroundColor: COLORS.green,
  },
});