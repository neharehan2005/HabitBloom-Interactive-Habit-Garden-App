import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useDispatch } from 'react-redux';
import { loginUser, loadHabits } from '../store/habitSlice';
import { auth, db } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import SignupScreen from './signup';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const dispatch = useDispatch();

  if (showSignup) {
    return <SignupScreen onBackToLogin={() => setShowSignup(false)} />;
  }

  const handleLogin = async () => {
    if (!email || !password) {
      window.alert("Please enter both email and password.");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 1️⃣ Set the user in Redux first
      dispatch(loginUser({
        uid: user.uid,
        name: user.displayName || 'Gardener',
        email: user.email
      }));

      // 2️⃣ Then load their habits from Firestore
      const snapshot = await getDocs(collection(db, 'users', user.uid, 'habits'));
      const habits = snapshot.docs.map(doc => ({
        ...doc.data(),
        firestoreId: doc.id   //  stored so we can update/delete later
      }));
      dispatch(loadHabits(habits));

    } catch (error: any) {
      window.alert("Login Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll} bounces={false}>
      <View style={styles.hero}>
        <View style={styles.circleTopRight} />
        <View style={styles.circleBottomLeft} />
        <View style={styles.heroTitleRow}>
          <View style={styles.iconTile}>
            <Text style={styles.iconEmoji}>👩🏻‍🌾👨‍🌾</Text>
          </View>
          <Text style={styles.heroTitle}>Welcome{'\n'}back</Text>

        </View>

        <Text style={styles.heroSub}>Your habits. Your growth. Your garden.</Text>
        <Text style={[styles.heroSub, { fontSize: 30 }, { marginTop: 0 }, { padding: 0 }, { textAlign: 'center' }, { fontWeight: 800 }]}>{'\n'}✦ Habit Garden ✦</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="leafy@garden.com"
          placeholderTextColor="#b2c9b3"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#b2c9b3"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="white" />
            : <>
              <Text style={styles.primaryBtnText}>Log in</Text>
              <View style={styles.arrowCircle}>
                <Text style={styles.arrowText}>→</Text>
              </View>
            </>
          }
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>new here?</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity onPress={() => setShowSignup(true)}>
          <Text style={styles.linkText}>
            Create an account{'  '}
            <Text style={styles.linkBold}>Sign up →</Text>
          </Text>
        </TouchableOpacity>
        <Text style={styles.footerLine}>Your growth story continues here.🍁</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    backgroundColor: '#0d1f0e'
  },
  hero: {
    backgroundColor: '#143016',
    paddingTop: 60,
    paddingHorizontal: 28,
    paddingBottom: 44,
    overflow: 'hidden'
  },
  circleTopRight: {
    position: 'absolute',
    width: 180, height: 180,
    borderRadius: 90,
    backgroundColor: '#1e4520',
    top: -40, right: -40
  },
  circleBottomLeft: {
    position: 'absolute',
    width: 100, height: 100,
    borderRadius: 50,
    backgroundColor: '#1a3a1c',
    bottom: -20, left: 20
  },
  iconTile: {
    width: 80, height: 56,
    backgroundColor: '#2e7d32',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center', gap: 16,
    marginBottom: 22
  },
  iconEmoji: {
    fontSize: 26
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '600',
    color: '#e8f5e9',
    lineHeight: 38, marginBottom: 8
  },
  heroSub: {
    fontSize: 15,
    color: '#81c784'
  },
  body: {
    flex: 1,
    backgroundColor: '#f8fdf8',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4a6b4b',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 7, marginTop: 4
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ddeedd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1b3a1c',
    marginBottom: 26
  },
  primaryBtn: {
    backgroundColor: '#2e7d32',
    borderRadius: 14,
    paddingVertical: 16,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10, marginBottom: 38
  },
  primaryBtnText: {
    color: 'white',
    fontSize: 16, fontWeight: '600'
  },
  arrowCircle: {
    width: 22, height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center'
  },
  arrowText: {
    color: 'white', fontSize: 11,
    lineHeight: 13
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12, marginBottom: 20
  },
  dividerLine: {
    flex: 1, height: 1,
    backgroundColor: '#d6ecd6'
  },
  dividerText: {
    fontSize: 12,
    color: '#a5d6a7'
  },
  linkText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#4caf50'
  },
  linkBold: {
    color: '#1b5e20',
    fontWeight: '600'
  },
  footerLine: {
    textAlign: 'center',
    fontSize: 13,
    color: '#a5d6a7',
    letterSpacing: 0.4,
    marginTop: 'auto',
    paddingTop: 40,
    paddingBottom: 8,
    marginHorizontal: 24
  },
});