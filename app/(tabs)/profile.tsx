import React, { useMemo, useState, useEffect, useRef, useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, Animated, Modal, Pressable, Switch, Platform,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { ThemeContext } from '../../components/ThemeContext';
import { logoutUser } from '../../store/habitSlice';
import { auth } from '../../firebaseConfig';
import { signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS = {
  background: '#FAFAFA', primary: '#F4511E', card: '#FFFFFF',
  textDark: '#212121', textLight: '#757575', lightOrange: '#e2f1a8',
};

const achievements = [
  { id: 'starter', icon: '📦', name: 'Starter', desc: 'Created your first habit' },
  { id: 'streak3', icon: '🔥', name: '3 Day Streak', desc: 'Maintained a 3 day streak' },
  { id: 'consistent', icon: '🌱', name: 'Consistent', desc: '7 days of consistency' },
  { id: 'master', icon: '⭐', name: 'Master', desc: 'Completed a 30 day challenge' },
];

type Habit = { id: string; name: string; streak: number; duration: number; };
type NotifSettings = { dailyReminder: boolean; streakAlert: boolean; };

// Mon=0 … Sun=6
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const NOTIF_KEY = 'notif_settings_v1';

function AnimatedBar({ percent, color }: { percent: number; color: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: percent, duration: 900, useNativeDriver: false }).start();
  }, [percent]);
  const width = anim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });
  return (
    <View style={barStyles.track}>
      <Animated.View style={[barStyles.fill, { width, backgroundColor: color }]} />
    </View>
  );
}
const barStyles = StyleSheet.create({
  track: { height: 8, backgroundColor: '#E0E0E0', borderRadius: 4, overflow: 'hidden', flex: 1 },
  fill: { height: '100%', borderRadius: 4 },
});

export default function ProfileScreen() {
  const [quote, setQuote] = useState<{ content: string; author: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notifLoaded, setNotifLoaded] = useState(false);
  const [notifSettings, setNotifSettings] = useState<NotifSettings>({
    dailyReminder: false,
    streakAlert: false,
  });

  const dispatch = useDispatch();
  const themeContext = useContext(ThemeContext);
  const user = useSelector((state: any) => state.habits?.user);
  const habits: Habit[] = useSelector((state: any) => state.habits.habits);

  // ── 1. Load saved notification settings once on mount ───────────
  useEffect(() => {
    AsyncStorage.getItem(NOTIF_KEY)
      .then(raw => {
        if (raw) {
          try { setNotifSettings(JSON.parse(raw)); } catch { }
        }
        setNotifLoaded(true);
      })
      .catch(() => setNotifLoaded(true));
  }, []);

  // ── 2. Persist whenever settings change (only after initial load) ─
  useEffect(() => {
    if (!notifLoaded) return;
    AsyncStorage.setItem(NOTIF_KEY, JSON.stringify(notifSettings));
  }, [notifSettings, notifLoaded]);

  // ── 3. Show alerts only after settings are loaded from storage ───
  useEffect(() => {
    if (!notifLoaded) return;
    if (notifSettings.dailyReminder) {
      alert("⏰ Daily Reminder: Don't forget to update your habits today!");
    }
    if (notifSettings.streakAlert) {
      const best = habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0;
      if (best > 0) alert(`🔥 Streak Alert: Your best streak is ${best} days! Keep it up!`);
    }
  }, [notifLoaded]);

  // ── Fetch motivational quote ─────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    fetch('https://motivational-spark-api.vercel.app/api/quotes/random')
      .then(r => r.json())
      .then(data => { setQuote({ content: data.quote, author: data.author || '' }); setLoading(false); })
      .catch(() => { setQuote({ content: '', author: '' }); setLoading(false); });
  }, []);

  const stats = useMemo(() => {
    const totalHabits = habits.length;
    const completedHabits = habits.filter(h => h.streak >= h.duration).length;
    const bestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0;
    const totalStreaks = habits.reduce((sum, h) => sum + (h.streak || 0), 0);
    return { totalHabits, completedHabits, bestStreak, totalStreaks };
  }, [habits]);

  // ── Weekly activity — Mon–Sun, anchored to today ─────────────────
  // JS getDay(): 0=Sun,1=Mon,…,6=Sat → convert to Mon-based (Mon=0,Sun=6)
  const todayMonIndex = (() => {
    const jsDay = new Date().getDay();
    return jsDay === 0 ? 6 : jsDay - 1;
  })();

  const weeklyActivity: boolean[] = useMemo(() => {
    const streak = Math.min(stats.bestStreak, 7);
    return WEEK_DAYS.map((_, i) => {
      const daysAgo = todayMonIndex - i;
      return daysAgo >= 0 && daysAgo < streak;
    });
  }, [stats.bestStreak, todayMonIndex]);

  const completionPct = stats.totalHabits > 0
    ? Math.round((stats.completedHabits / stats.totalHabits) * 100) : 0;

  const topHabits = useMemo(
    () => [...habits].sort((a, b) => b.streak - a.streak).slice(0, 3),
    [habits],
  );

  if (!themeContext) return null;
  const { selectedTheme, setSelectedTheme, themes } = themeContext;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(logoutUser());
    } catch (error: any) {
      Platform.OS === 'web' ? window.alert('Error logging out: ' + error.message) : console.log(error.message);
    }
  };

  const updateNotif = (key: keyof NotifSettings, value: boolean) =>
    setNotifSettings(prev => ({ ...prev, [key]: value }));

  return (
    <View style={[styles.root, { backgroundColor: selectedTheme.bg }]}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container}>

        {/* ── Profile Header ── */}
        <View style={[styles.header, { backgroundColor: selectedTheme.primary }]}>
          <View style={styles.iconTile}>
            <Text style={styles.iconEmoji}>👩🏻‍🌾👨‍🌾</Text>
          </View>
          <Text style={styles.greeting}>Hello! {user?.name || 'User'}</Text>
          <View style={styles.emailContainer}>
            <Text style={styles.emailIcon}>✉️</Text>
            <Text style={styles.emailText}>{user?.email || 'No email'}</Text>
          </View>
          <Text style={styles.tagline}>Growing one day at a time 🌱</Text>
        </View>

        {/* ── Motivation ── */}
        <View style={[styles.motivationContainer, { backgroundColor: selectedTheme.motivationBg, borderColor: selectedTheme.primary }]}>
          {loading
            ? <ActivityIndicator size="small" color={selectedTheme.primary} />
            : <>
              <Text style={[styles.quoteText, { color: selectedTheme.textContrast }]}>"{quote?.content}"</Text>
              {quote?.author ? <Text style={[styles.quoteAuthor, { color: selectedTheme.textContrast }]}>- {quote.author}</Text> : null}
            </>
          }
        </View>

        {/* ── Stats Grid ── */}
        <View style={styles.statsGrid}>
          {[
            { value: stats.totalHabits, label: 'Active' },
            { value: stats.completedHabits, label: 'Done' },
            { value: stats.bestStreak, label: 'Best' },
            { value: stats.totalStreaks, label: 'Total' },
          ].map(s => (
            <View key={s.label} style={styles.statCard}>
              <Text style={[styles.statValue, { color: selectedTheme.primary }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Theme Selector ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 Change Theme</Text>
          <View style={styles.themeRow}>
            {themes.map(theme => (
              <TouchableOpacity
                key={theme.name}
                style={[styles.themeBtn, {
                  backgroundColor: theme.bg,
                  borderWidth: selectedTheme.name === theme.name ? 2 : 1,
                  borderColor: selectedTheme.name === theme.name ? theme.primary : '#E0E0E0',
                }]}
                activeOpacity={0.8}
                onPress={() => setSelectedTheme(theme)}
              >
                <View style={[styles.themeDot, { backgroundColor: theme.primary }]} />
                <Text style={styles.themeName}>{theme.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Achievements ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Achievements</Text>
          <View style={styles.achievementsGrid}>
            {achievements.map(a => (
              <View key={a.id} style={styles.achievementCard}>
                <Text style={styles.achievementIcon}>{a.icon}</Text>
                <Text style={styles.achievementName}>{a.name}</Text>
                <Text style={styles.achievementDesc}>{a.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Weekly Activity — fixed, Mon–Sun, today highlighted ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 This Week's Activity</Text>
          <View style={styles.weekRow}>
            {WEEK_DAYS.map((day, i) => {
              const isFuture = i > todayMonIndex;
              const isToday = i === todayMonIndex;
              const isActive = weeklyActivity[i];
              return (
                <View key={day} style={styles.dayCol}>
                  <View style={[
                    styles.dayDot,
                    isFuture ? { backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#E0E0E0' }
                      : isActive ? { backgroundColor: selectedTheme.primary }
                        : { backgroundColor: '#E0E0E0' },
                  ]} />
                  <Text style={[styles.dayLabel, isToday && { fontWeight: '700', color: selectedTheme.primary }]}>
                    {day}
                  </Text>
                </View>
              );
            })}
          </View>
          <Text style={styles.weekCaption}>
            {weeklyActivity.filter(Boolean).length} / 7 days active this week
          </Text>
        </View>

        {/* ── Completion Overview ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Completion Overview</Text>
          <View style={styles.progressRow}>
            <Text style={[styles.progressPct, { color: selectedTheme.primary }]}>{completionPct}%</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <AnimatedBar percent={completionPct} color={selectedTheme.primary} />
              <Text style={styles.progressCaption}>{stats.completedHabits} of {stats.totalHabits} habits completed</Text>
            </View>
          </View>
        </View>

        {/* ── Top Habits Leaderboard ── */}
        {topHabits.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🥇 Top Habits by Streak</Text>
            {topHabits.map((h, idx) => (
              <View key={h.id} style={styles.leaderRow}>
                <Text style={styles.leaderRank}>#{idx + 1}</Text>
                <Text style={styles.leaderName} numberOfLines={1}>{h.name}</Text>
                <View style={{ flex: 1, marginHorizontal: 10 }}>
                  <AnimatedBar
                    percent={Math.min(100, Math.round((h.streak / (h.duration || 1)) * 100))}
                    color={selectedTheme.primary}
                  />
                </View>
                <Text style={[styles.leaderStreak, { color: selectedTheme.primary }]}>{h.streak}🔥</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Notification Settings trigger ── */}
        <TouchableOpacity
          style={[styles.section, styles.notifTrigger]}
          activeOpacity={0.85}
          onPress={() => setShowNotifModal(true)}
        >
          <Text style={styles.sectionTitle}>🔔 Notification Settings</Text>
          <Text style={styles.notifSubtitle}>
            {Object.values(notifSettings).filter(Boolean).length} of 2 enabled · Tap to manage
          </Text>
        </TouchableOpacity>

        {/* ── Quick Tips ── */}
        <View style={[styles.section, { backgroundColor: selectedTheme.motivationBg }]}>
          <Text style={styles.sectionTitle}>💡 Quick Tips</Text>
          {[
            'Start with just 2 minutes to build a habit.',
            'Link new habits to existing routines.',
            'Track progress visually for motivation.',
          ].map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <Text style={[styles.tipBullet, { color: selectedTheme.primary }]}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* ── Log Out ── */}
        <TouchableOpacity style={styles.btn} onPress={handleLogout}>
          <Text style={styles.btnText}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* ── Notification Modal ── */}
      <Modal visible={showNotifModal} transparent animationType="slide" onRequestClose={() => setShowNotifModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowNotifModal(false)}>
          <Pressable style={styles.modalSheet} onPress={e => e.stopPropagation()}>
            <Text style={styles.modalTitle}>🔔 Notifications</Text>
            {([
              { key: 'dailyReminder', label: 'Daily Reminder', icon: '⏰' },
              { key: 'streakAlert', label: 'Streak Alert', icon: '🔥' },
            ] as { key: keyof NotifSettings; label: string; icon: string }[]).map(item => (
              <View key={item.key} style={styles.notifRow}>
                <Text style={styles.notifIcon}>{item.icon}</Text>
                <Text style={styles.notifLabel}>{item.label}</Text>
                <Switch
                  value={notifSettings[item.key]}
                  onValueChange={v => updateNotif(item.key, v)}
                  trackColor={{ false: '#E0E0E0', true: selectedTheme.primary }}
                  thumbColor="#fff"
                />
              </View>
            ))}
            <TouchableOpacity
              style={[styles.modalClose, { backgroundColor: selectedTheme.primary }]}
              onPress={() => setShowNotifModal(false)}
            >
              <Text style={styles.modalCloseText}>Done</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { padding: 0, paddingBottom: 40 },
  header: { padding: 24, borderRadius: 10, alignItems: 'center', marginBottom: 7 },
  tagline: { color: COLORS.lightOrange, fontSize: 14, marginTop: 4 },
  iconTile: { width: 80, height: 76, backgroundColor: '#9fe2b3', borderRadius: 86, alignItems: 'center', justifyContent: 'center' },
  iconEmoji: { fontSize: 26 },
  greeting: { color: '#FFE0B2', fontSize: 14, marginTop: 6 },
  emailContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginTop: 8 },
  emailIcon: { fontSize: 12, marginRight: 6 },
  emailText: { color: '#FFF3E0', fontSize: 12 },
  motivationContainer: { margin: 10, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12, minHeight: 60, borderWidth: 1 },
  quoteText: { fontSize: 14, fontStyle: 'italic', textAlign: 'center', lineHeight: 18 },
  quoteAuthor: { fontSize: 12, fontWeight: '600', marginTop: 4, textAlign: 'center' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24, margin: 5 },
  statCard: { flex: 1, minWidth: '22%', backgroundColor: COLORS.card, padding: 16, borderRadius: 12, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold' },
  statLabel: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  section: { backgroundColor: COLORS.card, padding: 16, borderRadius: 16, marginBottom: 16, margin: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textDark, marginBottom: 12 },
  themeRow: { flexDirection: 'row', gap: 12 },
  themeBtn: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center' },
  themeDot: { width: 24, height: 24, borderRadius: 12, marginBottom: 6 },
  themeName: { fontSize: 12, color: COLORS.textDark, fontWeight: '500' },
  achievementsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  achievementCard: { flex: 1, minWidth: '45%', backgroundColor: '#F5F5F5', padding: 14, borderRadius: 12, alignItems: 'center' },
  achievementIcon: { fontSize: 28, marginBottom: 6 },
  achievementName: { fontSize: 13, fontWeight: '600', color: COLORS.textDark },
  achievementDesc: { fontSize: 10, color: COLORS.textLight, textAlign: 'center', marginTop: 2 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  dayCol: { alignItems: 'center', flex: 1 },
  dayDot: { width: 28, height: 28, borderRadius: 8, marginBottom: 4 },
  dayLabel: { fontSize: 10, color: COLORS.textLight },
  weekCaption: { fontSize: 12, color: COLORS.textLight, textAlign: 'center', marginTop: 4 },
  progressRow: { flexDirection: 'row', alignItems: 'center' },
  progressPct: { fontSize: 28, fontWeight: '800', minWidth: 60 },
  progressCaption: { fontSize: 11, color: COLORS.textLight, marginTop: 4 },
  leaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  leaderRank: { fontSize: 13, fontWeight: '700', color: COLORS.textLight, minWidth: 28 },
  leaderName: { fontSize: 13, color: COLORS.textDark, maxWidth: 90 },
  leaderStreak: { fontSize: 13, fontWeight: '700', minWidth: 42, textAlign: 'right' },
  notifTrigger: { paddingBottom: 12 },
  notifSubtitle: { fontSize: 12, color: COLORS.textLight, marginTop: -4 },
  tipRow: { flexDirection: 'row', marginBottom: 6 },
  tipBullet: { fontSize: 16, marginRight: 8, lineHeight: 20 },
  tipText: { fontSize: 13, color: COLORS.textDark, flex: 1, lineHeight: 20 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 14, borderRadius: 18, backgroundColor: '#E53935', marginHorizontal: 20, marginTop: 10, elevation: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, padding: 20 },
  btnText: { color: 'white', fontSize: 15, fontWeight: '700', letterSpacing: 0.5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textDark, marginBottom: 20 },
  notifRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  notifIcon: { fontSize: 22, marginRight: 12 },
  notifLabel: { flex: 1, fontSize: 15, color: COLORS.textDark },
  modalClose: { marginTop: 8, padding: 14, borderRadius: 14, alignItems: 'center' },
  modalCloseText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  name: { color: COLORS.card, fontSize: 22, fontWeight: 'bold' },
  levelBadge: { marginTop: 12, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  levelText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  milestoneCard: { borderLeftWidth: 4, borderLeftColor: '#FF9800' },
  milestoneRow: { flexDirection: 'row', alignItems: 'flex-start' },
  milestoneIcon: { fontSize: 40 },
  milestoneLabel: { fontSize: 18, fontWeight: '700' },
  milestoneHint: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
});

