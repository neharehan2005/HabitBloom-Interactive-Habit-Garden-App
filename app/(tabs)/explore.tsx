import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';

export default function InsightsScreen() {
  const habits = useSelector((state: any) => state.habits.habits);

  const avgProgress = habits.length > 0 
    ? Math.round((habits.reduce((acc: number, h: any) => acc + (h.streak / h.duration), 0) / habits.length) * 100) 
    : 0;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Garden Health 📊</Text>
      
      <View style={styles.statCard}>
        <Text style={styles.label}>Average Garden Growth</Text>
        <Text style={styles.value}>{avgProgress}%</Text>
        <View style={styles.progressBar}><View style={[styles.progressFill, { width: `${avgProgress}%` }]} /></View>
      </View>

      <View style={styles.row}>
        <View style={styles.miniCard}>
          <Text style={styles.miniVal}>{habits.length}</Text>
          <Text style={styles.miniLabel}>Seeds Sown</Text>
        </View>
        <View style={styles.miniCard}>
          <Text style={styles.miniVal}>{habits.filter((h: any) => h.streak >= h.duration).length}</Text>
          <Text style={styles.miniLabel}>Fully Bloomed</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8F5E9', padding: 25, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2E7D32', marginBottom: 20 },
  statCard: { backgroundColor: 'white', padding: 25, borderRadius: 20, marginBottom: 20, elevation: 4 },
  label: { color: '#666', fontSize: 16 },
  value: { fontSize: 48, fontWeight: 'bold', color: '#2E7D32', marginVertical: 10 },
  progressBar: { height: 10, backgroundColor: '#E8F5E9', borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#4CAF50' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  miniCard: { backgroundColor: 'white', width: '47%', padding: 20, borderRadius: 20, alignItems: 'center' },
  miniVal: { fontSize: 24, fontWeight: 'bold' },
  miniLabel: { fontSize: 12, color: '#999' }
});