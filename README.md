# 🌸 HabitBloom — Interactive Habit Garden App

> *Turn your daily habits into a thriving virtual garden.*

HabitBloom is a cross-platform mobile app that gamifies personal growth. Every habit you complete waters and grows a plant in your garden — making consistency visible, rewarding, and fun.

---

## ✨ Key Features

### 🌿 Habit Management
- Add, edit, and delete habits with ease
- Clean, intuitive interface designed for daily use
- Duplicate detection to keep your garden organized

### 🔥 Streak Tracking System
- Track daily progress and streak consistency
- Visual progress bars reflect how close you are to your goal
- Encourages long-term discipline through visible momentum

### 🌸 Interactive Garden-Based Tracking
- Every habit becomes a living plant in your personal garden
- Progress is visualized through a full garden ecosystem
- Plants grow through **4 distinct stages** as your streak builds:

  | Stage | Emoji | Progress |
  |---|---|---|
  | Seedling | 🌱 | 0 – 49% |
  | Sprout | 🌿 | 50 – 74% |
  | Tree | 🌳 | 75 – 99% |
  | Bloomed | 🌸 | 100% |

- Creates an emotional connection between your effort and visible growth

### 🎬 Animations & Micro-Interactions
- Smooth transitions and animated components throughout
- Visual feedback when completing (watering) habits
- Staggered card entrances, and floating particles
- Enhances user engagement and overall app feel

### 🌦️ Real-Time Weather Background
- Dynamic garden background powered by live weather data
- Environment adapts to real-world conditions — sunny, rainy, cloudy, night, and evening
- Animated elements: twinkling stars, fireflies, falling rain, floating moon
- Creates an immersive, ever-changing experience that reflects the real world

### 📊 Statistics Screen
- Dedicated stats dashboard for habit insights
- Tracks:
  - Habit completion rates
  - Streak performance over time
  - Overall progress across all habits
- Helps users analyze patterns and improve consistency

### 💬 Motivational Quotes
- API-powered dynamic quotes refreshed daily
- Encourages positivity and consistency
- Displayed contextually within the garden experience

### 🎨 Theme Customization
- Light and dark mode support
- Accent color theming for a personalized UI experience

### 📱 Mobile-First Design
- Fully optimized for iOS and Android
- Smooth, responsive navigation using Expo Router
- Designed for one-handed daily use

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo |
| Navigation | Expo Router (file-based) |
| State Management | Redux Toolkit (habits, weather, user) |
| Backend / Auth | Firebase Auth + Firestore |
| Weather | WeatherAPI.com (live condition + temperature) |
| UI | LinearGradient, BlurView, Animated API |
| Icons | Expo Vector Icons (FontAwesome) |

---

## 📁 Project Structure

```
HabitBloom/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # Habits list screen
│   │   └── gardenscreen.tsx   # Interactive garden view
│   ├── add.tsx                # Add new habit screen
│   ├── habitDetail.tsx        # Habit detail & stats
│   ├── login.tsx              # Login screen
│   ├── signup.tsx             # Signup screen
│   ├── LoginGate.tsx          # Auth guard
│   └── _layout.tsx            # Root layout
├── components/
│   └── ThemeContext.tsx        # Global theme provider
├── store/
│   ├── habitSlice.ts           # Habit CRUD + streak logic
│   ├── weatherSlice.ts         # Weather async thunk
│   └── store.ts                # Redux store config
├── utils/
│   └── habitUtils.ts           # Shared growth stage logic + emojis
├── assets/                     # Images and icons
├── firebaseConfig.ts           # Firebase initialization
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- A Firebase project with **Authentication** and **Firestore** enabled

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/neharehan2005/HabitBloom-Interactive-Habit-Garden-App.git
cd HabitBloom

# 2. Install dependencies
npm install

# 3. Add your Firebase config
# Edit firebaseConfig.ts with your project credentials

# 4. Start the development server
npx expo start
```

Then scan the QR code with **Expo Go** (iOS/Android) or press `i` for iOS simulator / `a` for Android emulator.

---

## 🌿 How It Works

```
Add a Habit → Water it Daily → Watch it Grow → Bloom at 100%
   🌱              💧              🌿              🌸
```

1. **Plant a seed** — create a habit with a name and goal duration
2. **Water daily** — mark it complete each day to build your streak
3. **Watch it grow** — your plant visually evolves through 4 stages
4. **Bloom** — reach 100% of your goal and your plant fully blooms 🌸


<div align="center">
  <i>Plant a seed today. Bloom tomorrow.</i>
</div>
