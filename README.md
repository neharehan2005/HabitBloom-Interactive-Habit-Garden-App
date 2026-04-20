# 🌸 HabitBloom — Interactive Habit Garden App

> *Turn your daily habits into a thriving virtual garden.*

HabitBloom is a cross-platform mobile app that gamifies personal growth. Every habit you complete waters and grows a plant in your garden — making consistency visible, rewarding, and fun.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🌱 **Virtual Garden** | Each habit becomes a plant that grows through 4 stages as your streak builds |
| 💧 **Daily Watering** | Mark habits complete each day to keep your plants alive |
| 🔥 **Streak Tracking** | Visual progress bars and growth stages reflect your consistency |
| 🌤️ **Live Weather Theme** | Garden background adapts to real local weather — sunny, rainy, night, and more |
| 💬 **Motivational Quotes** | Daily inspiration to keep you going |
| 🎨 **Theme Switching** | Light and dark mode with accent color customization |
| ☁️ **Cloud Sync** | Habits and progress persist across sessions via Firebase Firestore |
| 🔐 **Authentication** | Secure login and signup with Firebase Auth |

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
   🌱             💧              🌿              🌸
```

Each habit progresses through 4 growth stages based on your streak vs. goal duration:

| Stage | Emoji | Progress |
|---|---|---|
| Seedling | 🌱 | 0–49% |
| Sprout | 🌿 | 50–74% |
| Tree | 🌳 | 75–99% |
| Bloomed | 🌸 | 100% |

---

## 🔮 Roadmap

- [ ] Social garden sharing with friends
- [ ] Habit analytics dashboard with charts
- [ ] Push notifications for daily reminders
- [ ] Custom plant types and garden themes
- [ ] Offline support with local persistence

---



<div align="center">
  Made with 💚 and a lot of daily habits
  <br/>
  <i>Plant a seed today. Bloom tomorrow.</i>
</div>
