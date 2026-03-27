import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addHabit } from '../store/habitSlice';
import { router } from 'expo-router';
import { useContext } from 'react';
import { ThemeContext } from '../components/ThemeContext';

export default function AddHabitScreen() {
  const themeContext = useContext(ThemeContext);
    if (!themeContext) return null;
  
    const { selectedTheme } = themeContext;
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('30');
  const [type, setType] = useState('🌿 Fern');
  const dispatch = useDispatch();

  const handleSave = () => {
    if (!name || !duration) return;
    dispatch(addHabit({
      id: Date.now().toString(),
      name,
      duration: parseInt(duration),
      plantType: type,
      frequency: 'Daily',
      streak:0
    }));
    router.back();
  };

  return (
    <ScrollView contentContainerStyle={[styles.container,{ backgroundColor: selectedTheme.bg }]}>
      <Text style={[styles.title, { color: selectedTheme.primary }]}>Plant a Seed 🌱</Text>
      <Text style={[styles.label,{ color: selectedTheme.textContrast}]}>Habit Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Drink Water..." />
      
      <Text style={[styles.label,{ color: selectedTheme.textContrast}]}>Goal Duration (Days)</Text>
      <TextInput style={styles.input} value={duration} onChangeText={setDuration} keyboardType="numeric" />

      <Text style={[styles.label,{ color: selectedTheme.textContrast}]}>Select Species</Text>
      <View style={styles.row}>
        {['🌿 Fern', '🌵 Cactus', '🌻 Flower', '🌳 Tree'].map(p => (
          <TouchableOpacity key={p} style={[styles.chip, type === p && styles.active]} onPress={() => setType(p)}>
            <Text style={type === p ? {color: 'white'} : {}}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={[styles.btn,{ backgroundColor: selectedTheme.primary }]} onPress={handleSave}>
        <Text style={styles.btnText}>Start Growing</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 30, backgroundColor: '#E8F5E9', flexGrow: 1, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2E7D32', marginBottom: 20 },
  label: { fontWeight: 'bold', marginTop: 15, color: '#4CAF50' },
  input: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginTop: 5, borderWidth: 1, borderColor: '#C8E6C9' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  chip: { padding: 12, backgroundColor: 'white', borderRadius: 20, borderWidth: 1, borderColor: '#A5D6A7' },
  active: { backgroundColor: '#4CAF50', borderColor: '#2E7D32' },
  btn: { backgroundColor: '#2E7D32', padding: 18, borderRadius: 15, marginTop: 30, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 18 }
});