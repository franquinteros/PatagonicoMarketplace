import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"

const API_URL = "http://localhost:8080"

// Async thunks
export const fetchUserOrders = createAsyncThunk(
  "orders/fetchUserOrders",
  async (userId, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token
      if (!token) return rejectWithValue("Usuario no autenticado. Iniciar sesión")

      const response = await axios.get(`${API_URL}/api/orders/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data || error.message)
    }
  },
)

export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (orderData, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token
      if (!token) return rejectWithValue("Usuario no autenticado. Iniciar sesión")

      const response = await axios.post(`${API_URL}/api/orders/checkout`, orderData, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data || error.message)
    }
  },
)

// Slice
const orderSlice = createSlice({
  name: "orders",
  initialState: {
    orders: [],
    currentOrder: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearOrderError: (state) => {
      state.error = null
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch User Orders
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false
        state.orders = action.payload
        state.error = null
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false
        state.currentOrder = action.payload
        state.orders.push(action.payload)
        state.error = null
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearOrderError, clearCurrentOrder } = orderSlice.actions

export default orderSlice.reducer
