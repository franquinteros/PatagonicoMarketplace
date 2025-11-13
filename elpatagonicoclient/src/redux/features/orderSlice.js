import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080"

// Async thunks
export const fetchUserOrders = createAsyncThunk(
  "orders/fetchUserOrders",
  async ({ userId, token }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/orders/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Error al obtener órdenes")
      }

      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const createOrder = createAsyncThunk("orders/createOrder", async ({ orderData, token }, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_URL}/api/orders/checkout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Error al procesar la orden: ${errorText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

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
