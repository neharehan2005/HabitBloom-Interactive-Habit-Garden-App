import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useDispatch } from 'react-redux';
import { loginUser } from '../store/habitSlice';
import { auth } from '../firebaseConfig';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

interface Props {
  onBackToLogin?: () => void;
}

export default function SignupScreen({ onBackToLogin }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleSignup = async () => {
    if (name.trim().length < 2) {
      window.alert("Please enter a name for your gardener profile.");
      return;
    }
    if (!email || !password) {
      window.alert("Please enter an email and password.");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: name });
      // Dispatching this causes LoginGate to re-render and show <Slot /> (tabs)
      dispatch(loginUser({
        uid: user.uid,
        name: name,
        email: user.email
      }));
    } catch (error: any) {
      window.alert("Signup Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll} bounces={false}>

      {/* ── Dark hero ── */}
      <View style={styles.hero}>
        <View style={styles.circleTopRight} />
        <View style={styles.circleBottomLeft} />
        <View style={styles.iconTile}>
          <Text style={styles.iconEmoji}>⌛</Text>
        </View>
        <Text style={styles.heroTitle}>Start growing</Text>
        <Text style={styles.heroSub}>Plant your first habit today.</Text>
        <Text style={[styles.heroSub,{fontSize:30},{marginTop:0},{padding:0},{textAlign:'center'},{fontWeight:800}]}>{'\n'}✦ Habit Garden ✦</Text>
      </View>

      {/* ── White body card ── */}
      <View style={styles.body}>

        <Text style={styles.label}>Your name</Text>
        <TextInput
          style={styles.input}
          placeholder="PlantLover99"
          placeholderTextColor="#b2c9b3"
          value={name}
          onChangeText={setName}
        />

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
          placeholder="Min. 6 characters"
          placeholderTextColor="#b2c9b3"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleSignup}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="white" />
            : <>
              <Text style={styles.primaryBtnText}>Create garden</Text>
              <View style={styles.arrowCircle}>
                <Text style={styles.arrowText}>→</Text>
              </View>
            </>
          }
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>have an account?</Text>
          <View style={styles.dividerLine} />
        </View>

        {onBackToLogin && (
          <TouchableOpacity onPress={onBackToLogin}>
            <Text style={styles.linkText}>
              Already growing?{'  '}
              <Text style={styles.linkBold}>Log in →</Text>
            </Text>
          </TouchableOpacity>
        )}

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    backgroundColor: '#0d1f0e',
  },

  /* Hero */
  hero: {
    backgroundColor: '#143016',
    paddingTop: 60,
    paddingHorizontal: 28,
    paddingBottom: 44,
    overflow: 'hidden',
  },
  circleTopRight: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#1e4520',
    top: -40,
    right: -40,
  },
  circleBottomLeft: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1a3a1c',
    bottom: -20,
    left: 20,
  },
  iconTile: {
    width: 56,
    height: 56,
    backgroundColor: '#2e7d32',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconEmoji: {
    fontSize: 26,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '600',
    color: '#e8f5e9',
    lineHeight: 38,
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 15,
    color: '#81c784',
  },

  /* Body card */
  body: {
    flex: 1,
    backgroundColor: '#f8fdf8',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },

  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4a6b4b',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 7,
    marginTop: 4,
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
    marginBottom: 16,
  },

  primaryBtn: {
    backgroundColor: '#2e7d32',
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
    marginBottom: 28,
  },
  primaryBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  arrowCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    color: 'white',
    fontSize: 11,
    lineHeight: 13,
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#d6ecd6',
  },
  dividerText: {
    fontSize: 12,
    color: '#a5d6a7',
  },

  linkText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#4caf50',
  },
  linkBold: {
    color: '#1b5e20',
    fontWeight: '600',
  },
});
