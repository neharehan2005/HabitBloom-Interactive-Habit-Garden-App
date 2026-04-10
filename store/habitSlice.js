import { createSlice } from '@reduxjs/toolkit';

const habitSlice = createSlice({
  name: 'habits',
  initialState: {
    habits: [],
    user: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    logoutUser: (state) => {
      state.user = null;
      state.habits = [];
    },
    loadHabits: (state, action) => {
      state.habits = action.payload;
    },
    addHabit: (state, action) => {
      state.habits.push({
        ...action.payload,
        streak: 0,
        lastWateredDate: null,
      });
    },
    editHabit: (state, action) => {
      const index = state.habits.findIndex((h) => h.id === action.payload.id);
      if (index !== -1) {
        state.habits[index] = { ...state.habits[index], ...action.payload };
      }
    },
    deleteHabit: (state, action) => {
      state.habits = state.habits.filter((habit) => habit.id !== action.payload);
    },
    markProgress: (state, action) => {
      const habit = state.habits.find((h) => h.id === action.payload.id);
      if (habit) {
        const currentStreak = habit.streak || 0;
        if (currentStreak < habit.duration) {
          habit.streak = currentStreak + 1;
          habit.lastWateredDate = action.payload.date;
        }
      }
    },
  },
});

export const {
  setUser,
  setUser: loginUser,
  logoutUser,
  loadHabits,
  addHabit,
  editHabit,
  deleteHabit,
  markProgress,
} = habitSlice.actions;

export default habitSlice.reducer;