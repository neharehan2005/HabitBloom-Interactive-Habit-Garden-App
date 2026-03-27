import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { editHabit } from '../store/habitSlice'; 
import { router, useLocalSearchParams } from 'expo-router';
import { useContext } from 'react';
import { ThemeContext } from '../components/ThemeContext';

export default function EditHabitScreen() {
  const themeContext = useContext(ThemeContext);
    if (!themeContext) return null;
  
    const { selectedTheme } = themeContext;

  // 1. Grab the ID from the URL
  const { id } = useLocalSearchParams(); 
  const dispatch = useDispatch();

  // 2. Find the existing habit in the Redux store
  const existingHabit = useSelector((state: any) => 
    state.habits.habits.find((h: any) => h.id === id)
  );

  // Local state for the form
  const [habitName, setHabitName] = useState('');
  const [frequency, setFrequency] = useState('Daily');
  const [plantType, setPlantType] = useState('🌿 Fern');

  // 3. When the screen loads, fill the form with the existing data
  useEffect(() => {
    if (existingHabit) {
      setHabitName(existingHabit.name);
      setFrequency(existingHabit.frequency || 'Daily');
      setPlantType(existingHabit.plantType || '🌿 Fern');
    }
  }, [existingHabit]);

  const handleSave = () => {
    if (habitName.trim() === '') return;

    // 4. Dispatch the edit action with the updated data
    dispatch(editHabit({
      id: id,
      name: habitName,
      frequency: frequency,
      plantType: plantType,
    }));

    // Go back to the Garden!
    router.back();
  };

  return (
    <View style={[styles.container,{ backgroundColor: selectedTheme.bg }]}>
      <Text style={[styles.title, { color: selectedTheme.primary }]}>Prune Your Habit ✂️🌿</Text>
      
      <Text style={[styles.label,{ color: selectedTheme.textContrast}]}>Habit Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Drink Water..."
        value={habitName}
        onChangeText={setHabitName}
      />

      <Text style={[styles.label,{ color: selectedTheme.textContrast}]}>Frequency</Text>
      <View style={styles.row}>
        {['Daily', 'Weekly'].map((freq) => (
          <TouchableOpacity 
            key={freq} 
             style={[styles.chip, frequency === freq && styles.chipActive]}
             onPress={() => setFrequency(freq)}
          >
            <Text style={[styles.chipText, frequency === freq && { color: 'white' }]}>{freq}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.label,{ color: selectedTheme.textContrast}]}>Choose your Plant Species</Text>
      <View style={styles.row}>
        {['🌿 Fern', '🌵 Cactus', '🌳 Oak', '🌻 Sunflower'].map((plant) => (
          <TouchableOpacity 
            key={plant} 
            style={[styles.chip, plantType === plant && styles.chipActive]}
            onPress={() => setPlantType(plant)}
          >
            <Text style={[styles.chipText, plantType === plant && styles.chipTextActive]}>{plant}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={[styles.button,{ backgroundColor: selectedTheme.primary }]} onPress={handleSave}>
        <Text style={styles.buttonText}>Update Habit</Text>
      </TouchableOpacity>
    </View>
  );
}

// Exactly the same styling as the Add screen for consistency!
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#E8F5E9' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#2E7D32' },
  label: { fontSize: 16, fontWeight: '600', color: '#388E3C', marginBottom: 8, marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#A5D6A7', padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16, backgroundColor: 'white' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  chip: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 20, backgroundColor: 'white', borderWidth: 1, borderColor: '#A5D6A7' },
  chipActive: { backgroundColor: '#4CAF50', borderColor: '#2E7D32' },
  chipText: { color: '#2E7D32', fontWeight: '600' },
  chipTextActive: { color: 'white' },
  button: { backgroundColor: '#2E7D32', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, elevation: 3 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});