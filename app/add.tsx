import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';
import { useState, useContext, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addHabit } from '../store/habitSlice';
import { router } from 'expo-router';
import { ThemeContext } from '../components/ThemeContext';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';


// ── Growth preview: emoji bounces ──────────
function GrowthPreview({ duration }: { duration: number }) {
  const scale = useRef(new Animated.Value(1)).current;

  const getStage = () => {
    return { emoji: '🌱', label: 'First seedling' };
  };

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.35, duration: 140, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();
  }, [duration]);

  const { emoji, label } = getStage();

  return (
    <View style={preview.wrap}>
      <Animated.Text style={[preview.emoji, { transform: [{ scale }] }]}>{emoji}</Animated.Text>
      <Text style={preview.label}>{label}</Text>
    </View>
  );
}
const preview = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 20 },
  emoji: { fontSize: 72 },
  label: { fontSize: 13, color: '#81C784', fontWeight: '600', marginTop: 8, letterSpacing: 0.3 },
});

// ── Floating leaf decorations ────────────────────────────────────
function FloatingSeed({ delay, x }: { delay: number; x: number }) {
  const y = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = () => {
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0.6, duration: 400, useNativeDriver: true }),
          Animated.timing(y, { toValue: -44, duration: 2200, useNativeDriver: true }),
        ]),
        Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start(() => { y.setValue(0); loop(); });
    };
    loop();
  }, []);

  return (
    <Animated.Text style={[floatS.seed, { left: x, opacity, transform: [{ translateY: y }] }]}>
      🌿
    </Animated.Text>
  );
}
const floatS = StyleSheet.create({
  seed: { position: 'absolute', fontSize: 13, bottom: 0 },
});

// ── Main screen ──────────────────────────────────────────────────
export default function AddHabitScreen() {
  // All hooks before any early return
  const themeContext = useContext(ThemeContext);
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('30');
  const dispatch = useDispatch();
  const uid = useSelector((state: any) => state.habits.user?.uid);
  const habits = useSelector((state: any) => state.habits.habits);

  const btnScale = useRef(new Animated.Value(1)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(28)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 480, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, useNativeDriver: true }),
    ]).start();
  }, []);

  if (!themeContext) return null;
  const { selectedTheme } = themeContext;

  // ── Logic  ───────────────────────────────
  const handleSave = async () => {
    if (!name || !duration || !uid) return;

    const isDuplicate = habits.some(
      (h: any) => h.name.trim().toLowerCase() === name.trim().toLowerCase()
    );
    if (isDuplicate) {
      window.alert(`"${name}" already exists. Please choose a different habit name.`);
      return;
    }

    const newHabit = {
      id: Date.now().toString(),
      name,
      duration: parseInt(duration),
      plantType: '🌱',
      frequency: 'Daily',
      streak: 0,
      lastWateredDate: null,
    };

    const docRef = await addDoc(
      collection(db, 'users', uid, 'habits'),
      newHabit
    );

    dispatch(addHabit({ ...newHabit, firestoreId: docRef.id }));
    router.back();
  };

  const handlePressIn = () => Animated.spring(btnScale, { toValue: 0.95, useNativeDriver: true }).start();
  const handlePressOut = () => Animated.spring(btnScale, { toValue: 1, useNativeDriver: true }).start();

  const durationNum = parseInt(duration) || 0;

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: selectedTheme.bg }]}
      keyboardShouldPersistTaps="handled"
    >
      {/* Floating leaf decorations */}
      <View style={styles.floatWrap} pointerEvents="none">
        <FloatingSeed delay={0} x={18} />
        <FloatingSeed delay={600} x={75} />
        <FloatingSeed delay={1200} x={155} />
        <FloatingSeed delay={350} x={255} />
      </View>

      <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideUp }] }}>

        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: selectedTheme.textContrast }]}>← Back</Text>
        </TouchableOpacity>

        {/* Title */}
        <Text style={[styles.title, { color: selectedTheme.primary }]}>Plant a Seed 🌱</Text>
        <Text style={[styles.subtitle, { color: selectedTheme.textContrast }]}>
          What habit will you grow today?
        </Text>

        {/* Live growth preview — reacts to duration input */}
        <GrowthPreview duration={durationNum} />

        {/* Growth stage hint chips */}
        <View style={styles.hintRow}>
          {['🌱', '🌿', '🌳', '🌸'].map(h => (
            <View key={h} style={[styles.hintChip, { borderColor: selectedTheme.primary + '55' }]}>
              <Text style={[styles.hintText, { color: selectedTheme.primary }]}>{h}</Text>
            </View>
          ))}
        </View>

        {/* Habit Name */}
        <Text style={[styles.label, { color: selectedTheme.textContrast }]}>Habit Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Drink Water, Read, Meditate..."
          placeholderTextColor="#B2DFDB"
        />

        {/* Duration */}
        <Text style={[styles.label, { color: selectedTheme.textContrast }]}>Goal Duration (Days)</Text>
        <TextInput
          style={styles.input}
          value={duration}
          onChangeText={setDuration}
          keyboardType="numeric"
          placeholderTextColor="#B2DFDB"
        />

        {/* Animated CTA */}
        <Animated.View style={{ transform: [{ scale: btnScale }], marginTop: 30 }}>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: selectedTheme.primary }]}
            onPress={handleSave}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
          >
            <Text style={styles.btnEmoji}>🌱</Text>
            <Text style={styles.btnText}>Start Growing</Text>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.footer}>Every great garden starts with one seed.</Text>

      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 30, flexGrow: 1, justifyContent: 'center' },

  floatWrap: {
    position: 'absolute', bottom: 56, left: 0, right: 0,
    height: 60, overflow: 'hidden',
  },

  backBtn: { marginBottom: 10, alignSelf: 'flex-end' },
  backText: { fontSize: 16, fontWeight: 'bold' },

  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 4, opacity: 0.7 },

  hintRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 8 },
  hintChip: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  hintText: { fontSize: 11, fontWeight: '600' },

  label: { fontWeight: 'bold', marginTop: 15, marginBottom: 4 },
  input: {
    backgroundColor: 'white', padding: 15, borderRadius: 12,
    borderWidth: 1, borderColor: '#C8E6C9',
    fontSize: 15, color: '#1B5E20',
  },

  btn: {
    padding: 18, borderRadius: 15, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center', gap: 10,
  },
  btnEmoji: { fontSize: 20 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 18 },

  footer: {
    textAlign: 'center', fontSize: 13, color: '#A5D6A7',
    fontStyle: 'italic', marginTop: 24, letterSpacing: 0.3,
  },
});