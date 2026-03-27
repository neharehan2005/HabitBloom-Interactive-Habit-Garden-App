import { createSlice } from '@reduxjs/toolkit';

const habitSlice = createSlice({
  name: 'habits',
  initialState: { habits: [] },
  reducers: {
    setHabits: (state, action) => { state.habits = action.payload; },
    addHabit: (state, action) => {
      state.habits.push({ ...action.payload, streak: 0 });
    },
    deleteHabit: (state, action) => {
      state.habits = state.habits.filter(h => h.id !== action.payload);
    },
    incrementStreak: (state, action) => {
      const habit = state.habits.find(h => h.id === action.payload);
      if (habit && habit.streak < habit.duration) {
        habit.streak += 1;
      }
    },
    editHabit: (state, action) => {
      const index = state.habits.findIndex(h => h.id === action.payload.id);
      if (index !== -1) {
        state.habits[index] = { ...state.habits[index], ...action.payload };
      }
    }
  },
});

export const { setHabits, addHabit, deleteHabit, incrementStreak, editHabit } = habitSlice.actions;
export default habitSlice.reducer;