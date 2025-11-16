import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"

const API_BASE_URL = "http://localhost:8080"
const API_URL = "/api/payment_methods"

const getErr = (e) => e.response?.data || e.message
const authHeaders = (getState) => {
  const token = getState()?.auth?.token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Obtener métodos de pago
export const fetchPaymentMethods = createAsyncThunk(
  "paymentMethods/fetchPaymentMethods",
  async (_, { rejectWithValue, getState }) => {
    try {
      const res = await axios.get(`${API_BASE_URL}${API_URL}`, {
        headers: { ...authHeaders(getState) },
      })
      return res.data
    } catch (e) {
      return rejectWithValue(getErr(e))
    }
  }
)

// Crear método de pago
export const createPaymentMethod = createAsyncThunk(
  "paymentMethods/createPaymentMethod",
  async (formData, { rejectWithValue, getState }) => {
    try {
      const res = await axios.post(`${API_BASE_URL}${API_URL}`, formData, {
        headers: { "Content-Type": "application/json", ...authHeaders(getState) },
      })
      return res.data
    } catch (e) {
      return rejectWithValue(getErr(e))
    }
  }
)

// Actualizar método de pago
export const updatePaymentMethod = createAsyncThunk(
  "paymentMethods/updatePaymentMethod",
  async ({ id, formData }, { rejectWithValue, getState }) => {
    try {
      const res = await axios.put(`${API_BASE_URL}${API_URL}/${id}`, formData, {
        headers: { "Content-Type": "application/json", ...authHeaders(getState) },
      })
      return res.data
    } catch (e) {
      return rejectWithValue(getErr(e))
    }
  }
)

// Eliminar método de pago
export const deletePaymentMethod = createAsyncThunk(
  "paymentMethods/deletePaymentMethod",
  async (id, { rejectWithValue, getState }) => {
    try {
      await axios.delete(`${API_BASE_URL}${API_URL}/delete/${id}`, {
        headers: { ...authHeaders(getState) },
      })
      return id
    } catch (e) {
      return rejectWithValue(getErr(e))
    }
  }
)

const paymentMethodSlice = createSlice({
  name: "paymentMethods",
  initialState: { list: [], loading: false, error: null, selected: null },
  reducers: {
    setSelectedPaymentMethod(state, action) {
      state.selected = action.payload
    },
    clearSelectedPaymentMethod(state) {
      state.selected = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPaymentMethods.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPaymentMethods.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload
      })
      .addCase(fetchPaymentMethods.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || "Error al cargar métodos de pago"
      })
      .addCase(createPaymentMethod.fulfilled, (state, action) => {
        state.list.push(action.payload)
      })
      .addCase(createPaymentMethod.rejected, (state, action) => {
        state.error = action.payload || "Error al crear método de pago"
      })
      .addCase(updatePaymentMethod.fulfilled, (state, action) => {
        state.list = state.list.map((m) => (m.id === action.payload.id ? action.payload : m))
        if (state.selected?.id === action.payload.id) state.selected = action.payload
      })
      .addCase(updatePaymentMethod.rejected, (state, action) => {
        state.error = action.payload || "Error al actualizar método de pago"
      })
      .addCase(deletePaymentMethod.fulfilled, (state, action) => {
        state.list = state.list.filter((m) => m.id !== action.payload)
        if (state.selected?.id === action.payload) state.selected = null
      })
      .addCase(deletePaymentMethod.rejected, (state, action) => {
        state.error = action.payload || "Error al eliminar método de pago"
      })
  },
})

export const { setSelectedPaymentMethod, clearSelectedPaymentMethod } = paymentMethodSlice.actions
export default paymentMethodSlice.reducer
