import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"

const API_BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:8080"
const API_URL = "/api/discounts"
const getErr = (e) => e.response?.data || e.message

const authHeaders = (getState) => {
  const token = getState()?.auth?.token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Obtener descuentos
export const fetchDiscounts = createAsyncThunk("discounts/fetchDiscounts", async (_, { rejectWithValue, getState }) => {
  try {
    const res = await axios.get(`${API_BASE_URL}${API_URL}`, { headers: { ...authHeaders(getState) } })
    return res.data
  } catch (e) {
    return rejectWithValue(getErr(e))
  }
})

// Crear descuento
export const createDiscount = createAsyncThunk(
  "discounts/createDiscount",
  async (formData, { rejectWithValue, getState }) => {
    try {
      const payload = { amount: parseInt(formData.amount, 10), discountType: formData.discountType }
      const res = await axios.post(`${API_BASE_URL}${API_URL}`, payload, {
        headers: { "Content-Type": "application/json", ...authHeaders(getState) },
      })
      return res.data
    } catch (e) {
      return rejectWithValue(getErr(e))
    }
  }
)

// Actualizar descuento
export const updateDiscount = createAsyncThunk(
  "discounts/updateDiscount",
  async ({ id, formData }, { rejectWithValue, getState }) => {
    try {
      const payload = { amount: parseInt(formData.amount, 10), discountType: formData.discountType }
      const res = await axios.put(`${API_BASE_URL}${API_URL}/update/${id}`, payload, {
        headers: { "Content-Type": "application/json", ...authHeaders(getState) },
      })
      return res.data
    } catch (e) {
      return rejectWithValue(getErr(e))
    }
  }
)

// Eliminar descuento
export const deleteDiscount = createAsyncThunk(
  "discounts/deleteDiscount",
  async (id, { rejectWithValue, getState }) => {
    try {
      await axios.delete(`${API_BASE_URL}${API_URL}/${id}`, { headers: { ...authHeaders(getState) } })
      return id
    } catch (e) {
      return rejectWithValue(getErr(e))
    }
  }
)

// Asignar descuento a productos
export const assignDiscountToProducts = createAsyncThunk(
  "discounts/assignToProducts",
  async ({ discountId, productIds }, { rejectWithValue, getState }) => {
    try {
      const res = await axios.put(`${API_BASE_URL}${API_URL}/${discountId}/products`, productIds, {
        headers: { "Content-Type": "application/json", ...authHeaders(getState) },
      })
      return res.data
    } catch (e) {
      return rejectWithValue(getErr(e))
    }
  }
)

// Asignar descuento a categorías (paralelizado)
export const assignDiscountToCategories = createAsyncThunk(
  "discounts/assignToCategories",
  async ({ discountId, categoryIds }, { rejectWithValue, getState }) => {
    try {
      const headers = { "Content-Type": "application/json", ...authHeaders(getState) }
      const promises = categoryIds.map((categoryId) =>
        axios.put(`${API_BASE_URL}${API_URL}/${discountId}/category/${categoryId}`, null, { headers })
      )
      await Promise.all(promises)
      return { discountId, categoryIds }
    } catch (e) {
      return rejectWithValue(getErr(e))
    }
  }
)

const discountSlice = createSlice({
  name: "discounts",
  initialState: { list: [], loading: false, error: null, selected: null },
  reducers: {
    setSelectedDiscount(state, action) {
      state.selected = action.payload
    },
    clearSelectedDiscount(state) {
      state.selected = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDiscounts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDiscounts.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload
      })
      .addCase(fetchDiscounts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || "Error al cargar descuentos"
      })
      .addCase(createDiscount.fulfilled, (state, action) => {
        state.list.push(action.payload)
      })
      .addCase(createDiscount.rejected, (state, action) => {
        state.error = action.payload || "Error al crear descuento"
      })
      .addCase(updateDiscount.fulfilled, (state, action) => {
        state.list = state.list.map((d) => (d.id === action.payload.id ? action.payload : d))
        if (state.selected?.id === action.payload.id) state.selected = action.payload
      })
      .addCase(updateDiscount.rejected, (state, action) => {
        state.error = action.payload || "Error al actualizar descuento"
      })
      .addCase(deleteDiscount.fulfilled, (state, action) => {
        state.list = state.list.filter((d) => d.id !== action.payload)
        if (state.selected?.id === action.payload) state.selected = null
      })
      .addCase(deleteDiscount.rejected, (state, action) => {
        state.error = action.payload || "Error al eliminar descuento"
      })
      .addCase(assignDiscountToProducts.fulfilled, (state, action) => {
        const updated = action.payload
        if (updated?.id) {
          state.list = state.list.map((d) => (d.id === updated.id ? updated : d))
          if (state.selected?.id === updated.id) state.selected = updated
        }
      })
      .addCase(assignDiscountToProducts.rejected, (state, action) => {
        state.error = action.payload || "Error al asignar descuento a productos"
      })
      .addCase(assignDiscountToCategories.fulfilled, () => {})
      .addCase(assignDiscountToCategories.rejected, (state, action) => {
        state.error = action.payload || "Error al asignar descuento a categorías"
      })
  },
})

export const { setSelectedDiscount, clearSelectedDiscount } = discountSlice.actions
export default discountSlice.reducer
