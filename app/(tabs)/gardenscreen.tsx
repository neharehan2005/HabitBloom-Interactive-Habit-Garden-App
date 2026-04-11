import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Dimensions, Animated, Image, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSelector, useDispatch } from 'react-redux';
import { markProgress } from '../../store/habitSlice';
import { db } from '../../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

// ─── Greeting ─────────────────────────────────────────────────────────────────
const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { text: "Good Morning", icon: "☀️" };
    else if (hour >= 12 && hour < 17) return { text: "Good Afternoon", icon: "🌤️" };
    else if (hour >= 17 && hour < 20) return { text: "Good Evening", icon: "🌇" };
    else return { text: "Good Night", icon: "🌙" };
};

const { width, height } = Dimensions.get('window');

// ─── Weather theme tokens ─────────────────────────────────────────────────────
const THEMES = {
    night: {
        skyA: '#020510', skyB: '#0D1B3E', skyC: '#132040',
        groundA: '#071A0F', groundB: '#0E2E18',
        accent: '#A8D5A2', accentGlow: '#52B788',
        moonColor: '#FFF5CC', label: 'Clear Night',
    },
    evening: {
        skyA: '#1a0a2e', skyB: '#6B2D6B', skyC: '#E8875A',
        groundA: '#1B2A1B', groundB: '#2D4A2D',
        accent: '#FFB347', accentGlow: '#FF8C42',
        moonColor: '#FFD166', label: 'Good Evening',
    },
    sunny: {
        skyA: '#0A2342', skyB: '#1A6BAD', skyC: '#56CCF2',
        groundA: '#1B4332', groundB: '#2D6A4F',
        accent: '#FFD166', accentGlow: '#FF9A3C',
        moonColor: '#FFD166', label: 'Sunny',
    },
    rain: {
        skyA: '#060814', skyB: '#1a1a3e', skyC: '#2C3E6B',
        groundA: '#040E08', groundB: '#0D1F12',
        accent: '#90E0EF', accentGlow: '#48CAE4',
        moonColor: '#B0C4DE', label: 'Rainy',
    },
    cloud: {
        skyA: '#1A1A2E', skyB: '#2C3E50', skyC: '#4A5568',
        groundA: '#1B2838', groundB: '#2D3748',
        accent: '#E2E8F0', accentGlow: '#A0AEC0',
        moonColor: '#E2E8F0', label: 'Overcast',
    },
    'cloud-day': {
        skyA: '#7289da', skyB: '#99aab5', skyC: '#bcccdc',
        groundA: '#2d6a4f', groundB: '#1b4332',
        accent: '#E2E8F0', accentGlow: '#A0AEC0',
        moonColor: '#E2E8F0', label: 'Partly Cloudy',
    },
};

type WeatherType = keyof typeof THEMES;

// ─── weather helper — covers morning/afternoon/evening/night/rainy/cloudy ────────
const getLocalWeatherType = (conditionText: string): WeatherType => {
    const hour = new Date().getHours();
    const isMorning = hour >= 5 && hour < 12;
    const isAfternoon = hour >= 12 && hour < 17;
    const isEvening = hour >= 17 && hour < 20; // 👈 evening slot
    const isDay = isMorning || isAfternoon;

    const cond = conditionText.toLowerCase();

    // Rain overrides time of day
    if (cond.includes('rain')) return 'rain';

    // Cloudy — pick right variant
    if (cond.includes('cloud')) {
        if (isEvening) return 'evening';    // evening clouds → warm tone
        return isDay ? 'cloud-day' : 'cloud';
    }

    // Clear sky — pick by time slot
    if (isEvening) return 'evening';      // 👈 evening gets its own theme
    if (isDay) return 'sunny';
    return 'night';
};

// ─── Map streak/duration → growthStage 1–5 ───────────────────────────────────
const getGrowthStage = (streak: number, duration: number): number => {
    const p = (streak / Math.max(duration, 1)) * 100;
    if (p >= 100) return 4;
    if (p >= 75) return 3;
    if (p >= 50) return 2;
    if (p >= 0) return 1;
    return 0;
};

const STAGE_EMOJIS = ['🌱', '🌿', '🌳', '🌸'];

// ─── Twinkling Star ───────────────────────────────────────────────────────────
const Star = React.memo(({ x, y, size, delay }: { x: number; y: number; size: number; delay: number }) => {
    const op = useRef(new Animated.Value(Math.random() * 0.5 + 0.1)).current;
    useEffect(() => {
        const anim = Animated.loop(
            Animated.sequence([
                Animated.delay(delay),
                Animated.timing(op, { toValue: 1, duration: 1500, useNativeDriver: true }),
                Animated.timing(op, { toValue: 0.15, duration: 2000, useNativeDriver: true }),
            ])
        );
        anim.start();
        return () => anim.stop();
    }, []);
    return (
        <Animated.View style={{
            position: 'absolute', left: x, top: y,
            width: size, height: size, borderRadius: size / 2,
            backgroundColor: '#fff', opacity: op,
            shadowColor: '#fff', shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1, shadowRadius: size * 2,
        }} />
    );
});

// ─── Moon ─────────────────────────────────────────────────────────────────────
const Moon = ({ color }: { color: string }) => {
    const pulse = useRef(new Animated.Value(1)).current;
    const float = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.loop(Animated.sequence([
            Animated.timing(pulse, { toValue: 1.08, duration: 3000, useNativeDriver: true }),
            Animated.timing(pulse, { toValue: 1, duration: 3000, useNativeDriver: true }),
        ])).start();
        Animated.loop(Animated.sequence([
            Animated.timing(float, { toValue: -8, duration: 4000, useNativeDriver: true }),
            Animated.timing(float, { toValue: 0, duration: 4000, useNativeDriver: true }),
        ])).start();
    }, []);
    return (
        <Animated.View style={{
            position: 'absolute', top: 48, right: 28,
            alignItems: 'center', justifyContent: 'center',
            transform: [{ translateY: float }],
        }}>
            <Animated.View style={{
                position: 'absolute', width: 88, height: 88, borderRadius: 44,
                backgroundColor: color, opacity: 0.06,
                transform: [{ scale: pulse }],
            }} />
            <Animated.View style={{
                position: 'absolute', width: 62, height: 62, borderRadius: 31,
                backgroundColor: color, opacity: 0.1,
                transform: [{ scale: pulse }],
            }} />
            <View style={{
                width: 44, height: 44, borderRadius: 22, backgroundColor: color,
                shadowColor: color, shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.9, shadowRadius: 20, elevation: 20,
            }} />
            <View style={{ position: 'absolute', top: 10, left: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.08)' }} />
            <View style={{ position: 'absolute', top: 22, left: 22, width: 5, height: 5, borderRadius: 2.5, backgroundColor: 'rgba(0,0,0,0.07)' }} />
            <View style={{ position: 'absolute', top: 14, right: 9, width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.06)' }} />
        </Animated.View>
    );
};

// ─── Firefly ──────────────────────────────────────────────────────────────────
const Firefly = ({ color, delay }: { color: string; delay: number }) => {
    const x = useRef(new Animated.Value(Math.random() * width)).current;
    const y = useRef(new Animated.Value(height * 0.42 + Math.random() * height * 0.35)).current;
    const op = useRef(new Animated.Value(0)).current;
    const sz = useRef(Math.random() * 3 + 2).current;

    const drift = () => {
        Animated.parallel([
            Animated.timing(x, { toValue: Math.random() * width, duration: 4000 + Math.random() * 3000, useNativeDriver: true }),
            Animated.timing(y, { toValue: height * 0.42 + Math.random() * height * 0.35, duration: 4000 + Math.random() * 3000, useNativeDriver: true }),
            Animated.sequence([
                Animated.timing(op, { toValue: 0.9, duration: 1000, useNativeDriver: true }),
                Animated.timing(op, { toValue: 0.2, duration: 500, useNativeDriver: true }),
                Animated.timing(op, { toValue: 0.8, duration: 700, useNativeDriver: true }),
                Animated.timing(op, { toValue: 0, duration: 1500, useNativeDriver: true }),
            ]),
        ]).start(() => drift());
    };

    useEffect(() => { const t = setTimeout(drift, delay); return () => clearTimeout(t); }, []);

    return (
        <Animated.View style={{
            position: 'absolute', width: sz, height: sz, borderRadius: sz / 2,
            backgroundColor: color,
            shadowColor: color, shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1, shadowRadius: 6,
            transform: [{ translateX: x }, { translateY: y }],
            opacity: op,
        }} />
    );
};

// ─── Rain Drop ────────────────────────────────────────────────────────────────
const RainDrop = ({ delay, x, theme }: { delay: number; x: number; theme: typeof THEMES.rain }) => {
    const anim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.loop(Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, { toValue: 1, duration: 700, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])).start();
    }, []);
    const ty = anim.interpolate({ inputRange: [0, 1], outputRange: [-20, height] });
    const op = anim.interpolate({ inputRange: [0, 0.1, 0.9, 1], outputRange: [0, 0.6, 0.6, 0] });
    return (
        <Animated.View style={{
            position: 'absolute', left: x, width: 1.5, height: 20,
            backgroundColor: theme.accent, borderRadius: 1,
            transform: [{ translateY: ty }, { skewX: '-8deg' }],
            opacity: op,
        }} />
    );
};

// ─── Plant Card ───────────────────────────────────────────────────────────────
const PlantCard = ({
    plant, onWater, accent, accentGlow, staggerDelay, wateredToday, isBloomed,
}: {
    plant: { name: string; growthStage: number };
    onWater: () => void;
    accent: string; accentGlow: string; staggerDelay: number;
    wateredToday: boolean; isBloomed: boolean;
}) => {
    const slideUp = useRef(new Animated.Value(40)).current;
    const fadeIn = useRef(new Animated.Value(0)).current;
    const pressScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(slideUp, { toValue: 0, duration: 500, delay: staggerDelay, useNativeDriver: true }),
            Animated.timing(fadeIn, { toValue: 1, duration: 500, delay: staggerDelay, useNativeDriver: true }),
        ]).start();
    }, []);

    const onPressIn = () => Animated.spring(pressScale, { toValue: 0.955, useNativeDriver: true }).start();
    const onPressOut = () => Animated.spring(pressScale, { toValue: 1, friction: 5, useNativeDriver: true }).start();

    const isDisabled = isBloomed || wateredToday;
    const emoji = STAGE_EMOJIS[plant.growthStage - 1] ?? '🌱';
    const btnLabel = isBloomed ? '✦ Bloomed' : wateredToday ? '✓ Watered' : '💧 Water';
    const btnColor = isDisabled ? 'rgba(255,255,255,0.25)' : accent;
    const btnBg = isDisabled ? 'rgba(255,255,255,0.04)' : accent + '20';
    const btnBorder = isDisabled ? 'rgba(255,255,255,0.07)' : accent + '50';

    return (
        <Animated.View style={{
            transform: [{ translateY: slideUp }, { scale: pressScale }],
            opacity: fadeIn, width: (width - 52) / 2,
        }}>
            <TouchableOpacity onPressIn={onPressIn} onPressOut={onPressOut} onPress={onWater} disabled={isDisabled} activeOpacity={1}>
                <BlurView intensity={18} tint="dark" style={styles.plantCard}>
                    <LinearGradient colors={[accentGlow + '18', 'transparent'] as any} style={StyleSheet.absoluteFill} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} />

                    <View style={[styles.stageBadge, { borderColor: accent + '55', backgroundColor: accent + '15' }]}>
                        <Text style={[styles.stageBadgeText, { color: accent }]}>Stage {plant.growthStage}/4</Text>
                    </View>

                    <View style={styles.plantEmojiWrap}>
                        <View style={[styles.plantEmojiGlow, { backgroundColor: accentGlow + '22' }]} />
                        <Text style={styles.plantEmojiText}>{emoji}</Text>
                    </View>

                    <Text style={styles.plantName} numberOfLines={1}>{plant.name}</Text>

                    <View style={styles.pipRow}>
                        {Array.from({ length: 4 }).map((_, s) => (
                            <LinearGradient
                                key={s}
                                colors={s < plant.growthStage ? [accentGlow, accent] as any : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.1)'] as any}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                style={styles.pip}
                            />
                        ))}
                    </View>

                    <TouchableOpacity onPress={onWater} disabled={isDisabled} style={[styles.waterBtn, { backgroundColor: btnBg, borderColor: btnBorder }]}>
                        <Text style={[styles.waterBtnText, { color: btnColor }]}>{btnLabel}</Text>
                    </TouchableOpacity>
                </BlurView>
            </TouchableOpacity>
        </Animated.View>
    );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function GardenScreen() {
    const habits = useSelector((state: any) => state.habits.habits);
    const uid = useSelector((state: any) => state.habits.user?.uid);
    const dispatch = useDispatch();

    const [greeting, setGreeting] = useState(getGreeting());
    const [weather, setWeather] = useState<WeatherType>(getLocalWeatherType(''));
    const [weatherIcon, setWeatherIcon] = useState('');
    const [temperature, setTemperature] = useState<string | null>(null);

    const headerFade = useRef(new Animated.Value(0)).current;
    const headerSlide = useRef(new Animated.Value(-18)).current;

    const stars = useMemo(() =>
        Array.from({ length: 60 }, () => ({
            x: Math.random() * width, y: Math.random() * (height * 0.52),
            size: Math.random() * 2.5 + 0.8, delay: Math.random() * 4000,
        }))
        , []);

    const fireflies = useMemo(() =>
        Array.from({ length: 10 }, (_, i) => ({ delay: i * 700 }))
        , []);

    const rainDrops = useMemo(() =>
        Array.from({ length: 25 }, (_, i) => ({ delay: i * 120, x: Math.random() * width }))
        , []);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(headerFade, { toValue: 1, duration: 900, delay: 150, useNativeDriver: true }),
            Animated.timing(headerSlide, { toValue: 0, duration: 700, delay: 150, useNativeDriver: true }),
        ]).start();

        fetchWeather();
        const interval = setInterval(() => setGreeting(getGreeting()), 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchWeather = async () => {
        try {
            const response = await fetch(
                'https://api.weatherapi.com/v1/current.json?key=e0894036aa524cf7be1125045262903&q=Karachi,Pakistan'
            );
            const data = await response.json();
            const cond = data?.current?.condition?.text || '';
            const icon = data?.current?.condition?.icon || '';
            const temp = data?.current?.temp_c != null ? `${Math.round(data.current.temp_c)}°C` : null;
            setWeather(getLocalWeatherType(cond));
            setWeatherIcon(icon);
            if (temp) setTemperature(temp);
        } catch (e) {
            setWeather(getLocalWeatherType(''));
        }
    };

    // ── Water — syncs Redux + Firestore ───────────────────────────
    const water = async (habit: any) => {
        const today = new Date().toISOString().split('T')[0];
        if (habit.lastWateredDate === today || !uid) return;

        // 1️⃣ Update Redux immediately
        dispatch(markProgress({ id: habit.id, date: today }));

        // 2️⃣ Sync to Firestore so it persists
        if (habit.firestoreId) {
            try {
                await updateDoc(
                    doc(db, 'users', uid, 'habits', habit.firestoreId),
                    {
                        streak: (habit.streak || 0) + 1,
                        lastWateredDate: today,
                    }
                );
            } catch (e) {
                console.log('Firestore water sync failed:', e);
            }
        }
    };

    const theme = THEMES[weather];
    const today = new Date().toISOString().split('T')[0];
    const activeHabits = habits.filter((h: any) => getGrowthStage(h.streak || 0, h.duration || 1) < 4);
    const done = activeHabits.filter((h: any) => h.lastWateredDate === today).length;

    const healthLabel =
    activeHabits.length === 0 ? 'Blooming 🌸' :
        done === 0 ? 'Sleeping 😴' :
            done < 3 ? 'Growing 🌱' :
                done < activeHabits.length ? 'Thriving 🌿' : 'Blooming 🌸';

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <LinearGradient colors={[theme.skyA, theme.skyB, theme.skyC]} style={StyleSheet.absoluteFill} start={{ x: 0.3, y: 0 }} end={{ x: 0.7, y: 1 }} />

            {(weather === 'night' || weather === 'cloud') && stars.map((s, i) => <Star key={i} {...s} />)}

            {/* Moon for night/cloud, Sun for day, Sunset glow for evening */}
            {(weather === 'night' || weather === 'cloud') && <Moon color={theme.moonColor} />}
            {(weather === 'sunny' || weather === 'cloud-day') && (
                <View style={{ position: 'absolute', top: 50, right: 28 }}>
                    <Text style={{ fontSize: 52 }}>☀️</Text>
                </View>
            )}
            {weather === 'evening' && (
                <View style={{ position: 'absolute', top: 50, right: 28 }}>
                    <Text style={{ fontSize: 52 }}>🌇</Text>
                </View>
            )}

            {weather === 'rain' && rainDrops.map((r, i) => <RainDrop key={i} delay={r.delay} x={r.x} theme={theme} />)}
            {(weather === 'night' || weather === 'evening') && fireflies.map((f, i) => <Firefly key={i} color={theme.accent} delay={f.delay} />)}

            <LinearGradient colors={[theme.groundA, theme.groundB, '#0A1F0D']} style={styles.ground} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
            <LinearGradient colors={[theme.accentGlow + '16', 'transparent'] as any} style={styles.horizonMist} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} />

            <View style={styles.treesRow} pointerEvents="none">
                {['🌲', '🌳', '🌲', '🌳', '🌲', '🌳', '🌲'].map((t, i) => (
                    <Text key={i} style={[styles.treeEmoji, { fontSize: 26 + (i % 3) * 8, opacity: 0.3 + (i % 2) * 0.15 }]}>{t}</Text>
                ))}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                <Animated.View style={[styles.headerRow, { opacity: headerFade, transform: [{ translateY: headerSlide }] }]}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.greeting}>{greeting.text} {greeting.icon}</Text>
                        <Text style={styles.headerTitle}>My Garden</Text>
                        <Text style={styles.headerSub}>Nurture habits, grow your life</Text>
                    </View>
                    <BlurView intensity={22} tint="dark" style={styles.weatherChip}>
                        {weatherIcon
                            ? <Image source={{ uri: `https:${weatherIcon}` }} style={styles.weatherChipIcon} />
                            : <Text style={{ fontSize: 20 }}>
                                {weather === 'night' ? '🌙' : weather === 'evening' ? '🌇' : '☀️'}
                            </Text>
                        }
                        <View style={{ marginLeft: 6 }}>
                            <Text style={[styles.weatherChipLabel, { color: theme.accent }]}>{theme.label}</Text>
                            {temperature && <Text style={styles.weatherChipTemp}>{temperature}</Text>}
                        </View>
                    </BlurView>
                </Animated.View>

                <BlurView intensity={22} tint="dark" style={styles.statusCard}>
                    <LinearGradient colors={[theme.accentGlow + '22', theme.accent + '08'] as any} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
                    <View style={styles.statusRow}>
                        <View>
                            <Text style={styles.statusLabel}>GARDEN HEALTH</Text>
                            <Text style={[styles.statusValue, { color: theme.accent }]}>{healthLabel}</Text>
                        </View>
                        <View style={styles.statusRight}>
                            <Text style={styles.statusLabel}>WATERED TODAY</Text>
                           <Text style={[styles.statusValue, { color: theme.accent }]}>{done}/{activeHabits.length}</Text>
                        </View>
                    </View>
                    <View style={styles.progressBg}>
                        <LinearGradient
                            colors={[theme.accentGlow, theme.accent] as any}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={[styles.progressFill, {
                                width: habits.length === 0 || done === 0 ? 0 : `${(done / habits.length) * 100}%` as any,
                            }]}
                        />
                    </View>
                    <Text style={styles.progressCaption}>
                        {habits.length === 0
                            ? '🪴 Add a habit to start your garden'
                            : done === 0
                                ? '💤 Water a plant to begin your day'
                                :  done === activeHabits.length
                                    ? '🎉 All plants watered — amazing streak!'
                                    : `${habits.filter((h: any) => {
                                        const stage = getGrowthStage(h.streak || 0, h.duration || 1);
                                        return h.lastWateredDate !== today && stage < 4;
                                    }).length} plant${habits.filter((h: any) => {
                                        const stage = getGrowthStage(h.streak || 0, h.duration || 1);
                                        return h.lastWateredDate !== today && stage < 4;
                                    }).length !== 1 ? 's' : ''} still need attention`}
                    </Text>
                </BlurView>

                <View style={styles.sectionHeader}>
                    <View style={[styles.sectionAccentLine, { backgroundColor: theme.accent }]} />
                    <Text style={styles.sectionTitle}>Your Plants</Text>
                </View>

                {habits.length === 0 && (
                    <BlurView intensity={14} tint="dark" style={styles.emptyCard}>
                        <Text style={styles.emptyEmoji}>🪴</Text>
                        <Text style={styles.emptyTitle}>Your garden is empty</Text>
                        <Text style={styles.emptySub}>Go to the Habits tab and add your first habit to see it grow here!</Text>
                    </BlurView>
                )}
                {habits.length > 0 && (
                    <View style={styles.plantGrid}>
                        {habits.filter((habit: any) => getGrowthStage(habit.streak || 0, habit.duration || 1) < 4).map((habit: any, i: number) => {
                            const streak = habit.streak || 0;
                            const duration = habit.duration || 1;
                            const growthStage = getGrowthStage(streak, duration);
                            const wateredToday = habit.lastWateredDate === today;
                            const isBloomed = growthStage === 4;
                            return (
                                <PlantCard
                                    key={habit.id}
                                    plant={{ name: habit.name, growthStage }}
                                    onWater={() => water(habit)}
                                    accent={theme.accent}
                                    accentGlow={theme.accentGlow}
                                    staggerDelay={i * 90 + 300}
                                    wateredToday={wateredToday}
                                    isBloomed={isBloomed}
                                />
                            );
                        })}
                    </View>
                )}

                {habits.some((h: any) => getGrowthStage(h.streak || 0, h.duration || 1) === 4) && (
                    <>
                        <View style={styles.sectionHeader}>
                            <View style={[styles.sectionAccentLine, { backgroundColor: '#FFD166' }]} />
                            <Text style={styles.sectionTitle}>Bloomed Plants</Text>
                        </View>
                        <View style={styles.plantGrid}>
                            {habits.filter((habit: any) => getGrowthStage(habit.streak || 0, habit.duration || 1) === 4).map((habit: any, i: number) => (
                                <PlantCard
                                    key={habit.id}
                                    plant={{ name: habit.name, growthStage: 4 }}
                                    onWater={() => water(habit)}
                                    accent="#FFD166"
                                    accentGlow="#FF9A3C"
                                    staggerDelay={i * 90 + 300}
                                    wateredToday={habit.lastWateredDate === today}
                                    isBloomed={true}
                                />
                            ))}
                        </View>
                    </>
                )}
                <BlurView intensity={14} tint="dark" style={styles.quoteCard}>
                    <Text style={[styles.quoteIcon, { color: theme.accent }]}>✦</Text>
                    <Text style={styles.quoteText}>"A garden is a friend you can visit any time."</Text>
                    <Text style={styles.quoteAuthor}>— Daily Reminder</Text>
                </BlurView>

                <View style={{ height: 120 }} />
            </ScrollView>
        </View>
    );
}

// ─── Styles (unchanged) ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#020510' },
    ground: { position: 'absolute', bottom: 0, width: '148%', height: '44%', borderTopLeftRadius: 240, borderTopRightRadius: 240, alignSelf: 'center' },
    horizonMist: { position: 'absolute', bottom: '38%', width: '100%', height: 60 },
    treesRow: { position: 'absolute', bottom: '37%', width: '100%', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end' },
    treeEmoji: { lineHeight: 36 },
    scroll: { paddingTop: 58, paddingHorizontal: 18 },
    headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, marginTop: 8 },
    greeting: { fontSize: 12, color: 'rgba(255,255,255,0.45)', letterSpacing: 0.6, marginBottom: 2, fontWeight: '500' },
    headerTitle: { fontSize: 34, fontWeight: '800', color: '#fff', letterSpacing: -0.8, textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8 },
    headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.32)', marginTop: 3, fontStyle: 'italic' },
    weatherChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginTop: 8 },
    weatherChipIcon: { width: 28, height: 28 },
    weatherChipLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.2 },
    weatherChipTemp: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 1 },
    statusCard: { borderRadius: 24, overflow: 'hidden', padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 26 },
    statusRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
    statusRight: { alignItems: 'flex-end' },
    statusLabel: { fontSize: 10, color: 'rgba(255,255,255,0.32)', letterSpacing: 0.8, marginBottom: 4, fontWeight: '600' },
    statusValue: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
    progressBg: { width: '100%', height: 5, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden', marginBottom: 10 },
    progressFill: { height: 5, borderRadius: 3, minWidth: 5 },
    progressCaption: { fontSize: 11, color: 'rgba(255,255,255,0.32)', letterSpacing: 0.1 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 10 },
    sectionAccentLine: { width: 3, height: 18, borderRadius: 2 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#fff', letterSpacing: -0.3 },
    emptyCard: { borderRadius: 20, overflow: 'hidden', padding: 32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', alignItems: 'center', marginBottom: 22 },
    emptyEmoji: { fontSize: 56, marginBottom: 12 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: 'rgba(255,255,255,0.7)', marginBottom: 8 },
    emptySub: { fontSize: 13, color: 'rgba(255,255,255,0.35)', textAlign: 'center', lineHeight: 20 },
    plantGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: 22 },
    plantCard: { borderRadius: 22, overflow: 'hidden', padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', alignItems: 'center' },
    stageBadge: { alignSelf: 'flex-end', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1, marginBottom: 6 },
    stageBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
    plantEmojiWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    plantEmojiGlow: { position: 'absolute', width: 70, height: 70, borderRadius: 35 },
    plantEmojiText: { fontSize: 56, zIndex: 1 },
    plantName: { fontSize: 14, fontWeight: '700', color: '#fff', marginBottom: 8, letterSpacing: -0.1, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
    pipRow: { flexDirection: 'row', gap: 4, marginBottom: 12 },
    pip: { flex: 1, height: 4, borderRadius: 2 },
    waterBtn: { width: '100%', paddingVertical: 9, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
    waterBtnText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },
    quoteCard: { borderRadius: 20, overflow: 'hidden', padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', alignItems: 'center' },
    quoteIcon: { fontSize: 14, marginBottom: 8 },
    quoteText: { fontSize: 13, color: 'rgba(255,255,255,0.48)', textAlign: 'center', fontStyle: 'italic', lineHeight: 22, letterSpacing: 0.1 },
    quoteAuthor: { fontSize: 11, color: 'rgba(255,255,255,0.22)', marginTop: 8, letterSpacing: 0.6 },
});
