import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { incrementStreak, deleteHabit } from '../../store/habitSlice';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics'; 
import { useContext } from 'react';
import { ThemeContext } from '../../components/ThemeContext';
import { red } from 'react-native-reanimated/lib/typescript/Colors';

export default function GardenScreen() {
  const themeContext = useContext(ThemeContext);
  if (!themeContext) return null;

  const { selectedTheme } = themeContext;
  
  const habits = useSelector((state: any) => state.habits.habits);
  const dispatch = useDispatch();

  const getGrowthStage = (streak: number, duration: number) => {
    const progress = (streak / duration) * 100;
    if (progress >= 100) return '🌸';
    if (progress >= 70) return '🌳';
    if (progress >= 40) return '🌿';
    if (progress >= 10) return '🌱';
    return '📦'; 
  };

  const handleComplete = async (item: any) => {
    // 1. Light vibration for every checkmark click
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (item.streak + 1 >= item.duration) {
      // 2. SUCCESS VIBRATION: A notification-style pulse when it blooms!
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert(
        "Habit Bloomed! 🌸", 
        `Incredible! Your ${item.name} is now a beautiful flower in your garden.`
      );
    }
    
    dispatch(incrementStreak(item.id));
  };

  return (
    <View style={[styles.container,{ backgroundColor: selectedTheme.bg }]}>
      <View style={styles.headerRow}>
       <Text style={[styles.header, { color: selectedTheme.primary }]}>My Garden 🌿</Text>
        <Text style={[styles.countText,{ color: selectedTheme.textContrast}]}>{habits.length} Plants</Text>
      </View>

      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.card, item.streak >= item.duration && styles.completedCard,{ backgroundColor: selectedTheme.motivationBg },]}>
            <Text style={styles.growthIcon}>{getGrowthStage(item.streak, item.duration)}</Text>
            
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={[styles.name,{ color: selectedTheme.primary }]}>{item.name}</Text>
              <Text style={[styles.progress,{ color: selectedTheme.textContrast}]}>
                {item.streak >= item.duration ? 'Fully Grown!' : `Day ${item.streak} of ${item.duration}`}
              </Text>
              {/* Simple Progress Bar UI */}
              <View style={styles.miniBarContainer}>
                 <View style={[styles.miniBarFill, { width: `${(item.streak / item.duration) * 100}%` }]} />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.check, item.streak >= item.duration && { backgroundColor: '#FFD700' }, { backgroundColor: selectedTheme.primary }]} 
              onPress={() => handleComplete(item)}
              disabled={item.streak >= item.duration}
            >
              <Text style={{color: 'white', fontWeight: 'bold'}}>{item.streak >= item.duration ? '★' : '✓'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => dispatch(deleteHabit(item.id))} style={[styles.delete, { backgroundColor: '#CD5C5C' }]}>
              <Text style={{color: 'white', fontSize: 10}}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={[styles.emptyText,{ color: selectedTheme.textContrast}]}>Your garden is quiet... plant something! 🌱</Text>}
      />

      <TouchableOpacity style={[styles.addBtn, { backgroundColor: selectedTheme.primary }]} onPress={() => router.push('/add')}>
        <Text style={styles.addBtnText}>+ New Habit</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.addBtn, { backgroundColor: selectedTheme.primary }]} onPress={() => router.push('/edit')}>
        <Text style={styles.addBtnText}>- Edit Habit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F8E9', padding: 20, paddingTop: 60 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 },
  header: { fontSize: 32, fontWeight: 'bold', color: '#2E7D32' },
  countText: { color: '#81C784', fontWeight: 'bold' },
  card: { backgroundColor: 'white', padding: 18, borderRadius: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  completedCard: { borderColor: '#FFD700', borderWidth: 2 },
  growthIcon: { fontSize: 42 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#1B5E20' },
  progress: { color: '#66BB6A', fontSize: 13, marginBottom: 5 },
  miniBarContainer: { height: 4, backgroundColor: '#E8F5E9', borderRadius: 2, width: '80%' },
  miniBarFill: { height: '100%', backgroundColor: '#4CAF50', borderRadius: 2 },
  check: { backgroundColor: '#4CAF50', width: 45, height: 45, borderRadius: 23, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  delete: { backgroundColor: '#FF8A80', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  addBtn: { backgroundColor: '#2E7D32', padding: 18, borderRadius: 20, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.2, elevation: 5,margin:10 },
  addBtnText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  emptyText: { textAlign: 'center', marginTop: 100, color: '#A5D6A7', fontSize: 16 }
});