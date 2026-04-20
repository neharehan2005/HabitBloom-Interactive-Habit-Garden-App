import React, { useContext } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Alert, Platform, SafeAreaView
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { router } from 'expo-router';
import { ThemeContext } from '../../components/ThemeContext';
import { deleteHabit, markProgress } from '../../store/habitSlice';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { db } from '../../firebaseConfig';
import { doc, deleteDoc } from 'firebase/firestore';
import { getGrowthStage, STAGE_EMOJIS } from '../../utils/habitUtils';

export default function Index() {
  const themeContext = useContext(ThemeContext);
  if (!themeContext) return null;
  const { selectedTheme } = themeContext;
  const uid = useSelector((state: any) => state.habits.user?.uid);
  const habits = useSelector((state: any) => state.habits.habits);
  const dispatch = useDispatch();


  const handleWaterPlant = (habit: any) => {
    const today = new Date().toISOString().split('T')[0];
    if (habit.lastWateredDate === today) {
      const msg = "Already watered today! 💧\nCome back tomorrow to keep growing.";
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert("Wait!", msg);
      return;
    }
    const streak = habit.streak || 0;
    const duration = habit.duration || 1;
    if (streak < duration) {
      dispatch(markProgress({ id: habit.id, date: today }));
    } else {
      const msg = "Fully Bloomed! 🌸 This plant is already fully grown!";
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert("Yay!", msg);
    }
  };

  // Replace handleDelete with this:
  const handleDelete = async (habit: any) => {
    const doDelete = async () => {
      // 1️⃣ Remove from Redux
      dispatch(deleteHabit(habit.id));

      // 2️⃣ Remove from Firestore
      if (uid && habit.firestoreId) {
        try {
          await deleteDoc(doc(db, 'users', uid, 'habits', habit.firestoreId));
        } catch (e) {
          console.log('Firestore delete failed:', e);
        }
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm("Remove this plant from your garden? 🌱")) await doDelete();
    } else {
      Alert.alert("Uproot Plant", "Remove this from your garden?", [
        { text: "Cancel", style: "cancel" },
        { text: "Uproot", style: "destructive", onPress: doDelete }
      ]);
    }
  };

  // ── Single card renderer ─────────────────────────────────────────
  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const streak = item.streak || 0;
    const duration = item.duration || 1;
    const pct = Math.min((streak / duration) * 100, 100);
    const done = streak >= duration;
    const wateredToday = item.lastWateredDate === new Date().toISOString().split('T')[0];

    return (
      <View style={[styles.card, done && styles.cardDone]}>
        {/* Left accent stripe */}
        <View style={[styles.stripe, { backgroundColor: done ? '#FFD700' : selectedTheme.primary }]} />

        {/* Growth emoji */}
        <View style={styles.iconWrap}>
          <Text style={styles.growthEmoji}>{STAGE_EMOJIS[getGrowthStage(streak, duration) - 1] ?? '🌱'}</Text>
        </View>

        {/* Content */}
        <View style={styles.cardBody}>
          <Text style={styles.habitName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.habitSub}>
            {done ? '🌸 Fully Grown!' : `Day ${streak} of ${duration}`}
          </Text>

          {/* Progress bar */}
          <View style={styles.barTrack}>
            <View style={[
              styles.barFill,
              { width: `${pct}%`, backgroundColor: done ? '#FFD700' : selectedTheme.primary }
            ]} />
          </View>
          <Text style={styles.pctText}>{Math.round(pct)}%</Text>
        </View>

        {/* Actions */}
        <View style={styles.cardActions}>
          {/* Water */}
          <TouchableOpacity
            style={[styles.actionBtn, styles.waterBtn, wateredToday && styles.disabledBtn]}
            onPress={() => handleWaterPlant(item)}
            disabled={wateredToday}
          >
            <FontAwesome name="tint" size={16} color="white" />
          </TouchableOpacity>

          {/* Detail */}
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: selectedTheme.primary }]}
            onPress={() => router.push({
              pathname: '/habitDetail',
              params: { id: item.id },
            })}

          >
            <FontAwesome name="leaf" size={16} color="white" />
          </TouchableOpacity>

          {/* Delete */}
          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={() => handleDelete(item)}
          >
            <FontAwesome name="trash" size={16} color="#D32F2F" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ── Empty state ──────────────────────────────────────────────────
  const EmptyState = () => (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyEmoji}>🪴</Text>
      <Text style={styles.emptyTitle}>Your garden is empty</Text>
      <Text style={styles.emptySub}>Plant your first habit and watch it grow!</Text>
    </View>
  );

  // ── Header ───────────────────────────────────────────────────────
  const Header = () => (
    <View style={styles.header}>
      <View>
        <Text style={[styles.headerTitle, { color: selectedTheme.primary }]}>My Garden</Text>
        <Text style={[styles.headerSub, { color: selectedTheme.textContrast }]}>{habits.length} plant{habits.length !== 1 ? 's' : ''} growing</Text>
      </View>
      <Text style={styles.headerEmoji}>🌿</Text>
    </View>
  );

  // ── Root render ──────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={<Header />}
        ListEmptyComponent={<EmptyState />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB row */}
      <View style={styles.fabRow}>
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: selectedTheme.primary }]}
          onPress={() => router.push('/add')}
        >
          <FontAwesome name="plus" size={18} color="white" />
          <Text style={styles.fabText}>New Habit</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F1F8E9',
  },
  list: {
    paddingHorizontal: 18,
    paddingBottom: 110,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1B5E20',
    letterSpacing: -0.5,
    marginTop: 10,
  },
  headerSub: {
    fontSize: 14,
    color: '#81C784',
    marginTop: 2,
    fontWeight: '500',
  },
  headerEmoji: { fontSize: 40 },

  // ── Card ──
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#2E7D32',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  cardDone: {
    borderWidth: 1.5,
    borderColor: '#FFD700',
  },
  stripe: {
    width: 5,
    alignSelf: 'stretch',
  },
  iconWrap: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  growthEmoji: { fontSize: 36 },
  cardBody: {
    flex: 1,
    paddingVertical: 14,
    paddingRight: 8,
  },
  habitName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 2,
  },
  habitSub: {
    fontSize: 12,
    color: '#81C784',
    marginBottom: 8,
    fontWeight: '500',
  },
  barTrack: {
    height: 6,
    backgroundColor: '#E8F5E9',
    borderRadius: 3,
    overflow: 'hidden',
    width: '90%',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  pctText: {
    fontSize: 11,
    color: '#A5D6A7',
    marginTop: 4,
    fontWeight: '600',
  },

  // ── Action buttons ──
  cardActions: {
    paddingRight: 14,
    paddingVertical: 14,
    gap: 8,
    alignItems: 'center',
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waterBtn: { backgroundColor: '#42A5F5' },
  deleteBtn: { backgroundColor: '#FFCDD2' },
  disabledBtn: { opacity: 0.4 },

  // ── Empty ──
  emptyWrap: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyEmoji: { fontSize: 72, marginBottom: 16 },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 15,
    color: '#A5D6A7',
    textAlign: 'center',
    lineHeight: 22,
  },

  // ── FAB ──
  fabRow: {
    position: 'absolute',
    bottom: 24,
    left: 18,
    right: 18,
    flexDirection: 'row',
    gap: 12,
  },
  fab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 18,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  fabSecondary: {
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: '#C8E6C9',
    flex: 0.45,
  },
  fabText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
  },
});