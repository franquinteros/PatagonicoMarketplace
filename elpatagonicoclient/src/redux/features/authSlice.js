// src/redux/features/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080"

// ===================== THUNKS =====================

// LOGIN
export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      console.log("[v0] authSlice - API_URL:", API_URL)
      console.log("[v0] authSlice - Attempting login for:", email)

      const response = await fetch(`${API_URL}/api/v1/auth/authenticate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      console.log("[v0] authSlice - Login response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[v0] authSlice - Login error:", errorData)
        throw new Error(errorData.message || "Error al iniciar sesión")
      }

      const data = await response.json()
      console.log("[v0] authSlice - Login successful:", data)

      // 👇 ACÁ LEEMOS BIEN EL TOKEN DEL BACK
      const token = data.access_token || data.token || data.accessToken
      const user = data.user || data

      if (!token) {
        throw new Error("No se recibió el token de autenticación del servidor")
      }

      // 👇 Guardamos también en localStorage para el código viejo
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))

      return {
        user,
        token,
      }
    } catch (error) {
      console.error("[v0] authSlice - Login exception:", error)
      return rejectWithValue(error.message)
    }
  },
)

// REGISTER
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      console.log("[v0] authSlice - API_URL:", API_URL)
      console.log("[v0] authSlice - Attempting registration:", userData.email)

      const response = await fetch(`${API_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      console.log("[v0] authSlice - Register response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[v0] authSlice - Register error:", errorData)
        throw new Error(errorData.message || "Error al registrarse")
      }

      const data = await response.json()
      console.log("[v0] authSlice - Registration successful:", data)

      const token = data.access_token || data.token || data.accessToken
      const user = data.user || data

      if (!token) {
        throw new Error("No se recibió el token de autenticación del servidor")
      }

      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))

      return {
        user,
        token,
      }
    } catch (error) {
      console.error("[v0] authSlice - Register exception:", error)
      return rejectWithValue(error.message)
    }
  },
)

// UPDATE PROFILE (como ya lo tenías)
export const updateUserProfile = createAsyncThunk(
  "auth/updateProfile",
  async ({ userId, userData, token }, { rejectWithValue }) => {
    try {
      console.log("[authSlice] Updating profile for user:", userId)

      const response = await fetch(`${API_URL}/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      })

      console.log("[authSlice] Update response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[authSlice] Update error:", errorData)
        throw new Error(errorData.message || "Error al actualizar perfil")
      }

      const data = await response.json()
      console.log("[authSlice] Profile updated:", data)

      return data
    } catch (error) {
      console.error("[authSlice] Update exception:", error)
      return rejectWithValue(error.message)
    }
  },
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
  },
  reducers: {
    logout: (state) => {
      console.log("[authSlice] Logging out")
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null

      // limpiar también el storage
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    },
    clearError: (state) => {
      state.error = null
    },
    setCredentials: (state, action) => {
      console.log("[authSlice] Setting credentials:", action.payload)
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true

      if (action.payload.token) {
        localStorage.setItem("token", action.payload.token)
      }
      if (action.payload.user) {
        localStorage.setItem("user", JSON.stringify(action.payload.user))
      }
    },
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

export const { logout, clearError, setCredentials } = authSlice.actions

// ===================== SELECTORS =====================
export const selectUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectToken = (state) => state.auth.token
export const selectIsAdmin = (state) => state.auth.user?.role === "ADMIN"

export default authSlice.reducer
