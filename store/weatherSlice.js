import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// 1. Async thunk (API call inside Redux)
export const fetchWeather = createAsyncThunk(
  'weather/fetchWeather',
  async () => {
    const res = await fetch(
      'https://api.weatherapi.com/v1/current.json?key=d37e8107d634483e992125505261204&q=Karachi,Pakistan'
    );
    return await res.json();
  }
);

const weatherSlice = createSlice({
  name: 'weather',
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeather.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeather.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchWeather.rejected, (state) => {
        state.loading = false;
        state.error = 'Failed to fetch weather';
      });
  },
});

export default weatherSlice.reducer;