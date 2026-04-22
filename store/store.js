import { configureStore } from '@reduxjs/toolkit';
import habitReducer from './habitSlice';
import weatherReducer from './weatherSlice';

export const store = configureStore({
   reducer: {
    habits: habitReducer,
    weather: weatherReducer,
  },
});


