// src/redux/features/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios";

const API_URL = "http://localhost:8080"

// ===================== THUNKS =====================

// LOGIN
export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password },  { rejectWithValue }) => {
    try{
    const {data} = await axios.post(`${API_URL}/api/v1/auth/authenticate`, 
      { email, password
        }
      )
      const token = data.access_token || data.token || data.accessToken
      const user = data.user || data

      return {
        user,
        token,
      }
    }catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// REGISTER
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, {rejectWithValue}) => {
    try {

      const {data} = await axios.post(`${API_URL}/api/v1/auth/register`, 
        userData
      )

      const token = data.access_token || data.token || data.accessToken
      const user = data.user || data

      return {
        user,
        token,
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateUserProfile = createAsyncThunk(
  "auth/updateProfile",
  async ({ userId, userData, token }, {rejectWithValue}) => {
    try {
      const {data} = await axios.put(`${API_URL}/api/users/${userId}`, 
        userData,
        {headers: { Authorization: `Bearer ${token}` }}  // Enviar token en el header
      )
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// ===================== SLICE =====================

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    isAuthModalOpen: false //la idea es que los componentes reendericen según esta propiedad
  },
  reducers: {
    logout: (state) => {
      console.log("[authSlice] Logging out")
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null


    },
    clearError: (state) => {
      state.error = null
    },
    // setCredentials: (state, action) => {
    //   console.log("[authSlice] Setting credentials:", action.payload)
    //   state.user = action.payload.user
    //   state.token = action.payload.token
    //   state.isAuthenticated = true

    //   if (action.payload.token) {
    //     localStorage.setItem("token", action.payload.token)
    //   }
    //   if (action.payload.user) {
    //     localStorage.setItem("user", JSON.stringify(action.payload.user))
    //   }
    // },
    openAuthModal: (state) =>{
      state.isAuthModalOpen = true;
    },
    closeAuthModal: (state)=>{
      state.isAuthModalOpen = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginUser.pending, (state) => {
        console.log("[authSlice] Login pending.")
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log("[authSlice] Login fulfilled")
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        console.error("[authSlice] Login rejected:", action.payload)
        state.loading = false
        state.error = action.payload
      })
      // REGISTER
      .addCase(registerUser.pending, (state) => {
        console.log("[authSlice] Register pending.")
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        console.log("[authSlice] Register fulfilled")
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(registerUser.rejected, (state, action) => {
        console.error("[authSlice] Register rejected:", action.payload)
        state.loading = false
        state.error = action.payload
      })
      // UPDATE PROFILE
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        console.log("[authSlice] Update profile fulfilled")
        state.user = {
          ...state.user,
          ...action.payload,
        }
      })
  },
})

export const { logout, clearError, openAuthModal, closeAuthModal} = authSlice.actions

// ===================== SELECTORS =====================
export const selectUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectToken = (state) => state.auth.token
export const selectIsAdmin = (state) => state.auth.user?.role === "ADMIN"

export default authSlice.reducer
