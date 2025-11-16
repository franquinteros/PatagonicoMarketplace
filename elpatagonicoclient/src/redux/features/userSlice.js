import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { loginUser, registerUser } from './authSlice';

const API_URL = 'http://localhost:8080/api';

// Thunk para obtener el perfil del usuario logeado
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth?.token;
      if (!token) return rejectWithValue('Usuario no autenticado');

      const response = await axios.get(`${API_URL}/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Thunk para actualizar el perfil del usuario
export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (userData, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth?.token;
      if (!token) return rejectWithValue('Usuario no autenticado');

      const response = await axios.put(`${API_URL}/user/profile`, userData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    currentUser: null, // Aquí se guarda el usuario logeado
    loading: false,
    error: null,
  },
  reducers: {
    // Acción para setear el usuario manualmente (útil después del login)
    setUser: (state, action) => {
      state.currentUser = action.payload;
    },
    // Acción para limpiar el usuario (útil en logout)
    clearUser: (state) => {
      state.currentUser = null;
      state.error = null;
    },
    // Limpiar errores
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch User Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentUser = null;
      })
      // Update User Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Sync with auth slice: when user logs in / registers store current user here as well
    builder
      .addCase(loginUser.fulfilled, (state, action) => {
        state.currentUser = action.payload.user || null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.currentUser = action.payload.user || null;
      });
  },
});

export const { setUser, clearUser, clearError } = userSlice.actions;

// Selectores para acceder fácilmente al estado
export const selectCurrentUser = (state) => state.user.currentUser;
export const selectUserId = (state) => state.user.currentUser?.id;
export const selectUserEmail = (state) => state.user.currentUser?.email;
export const selectUserRole = (state) => state.user.currentUser?.role;
export const selectUserLoading = (state) => state.user.loading;
export const selectUserError = (state) => state.user.error;

export default userSlice.reducer;