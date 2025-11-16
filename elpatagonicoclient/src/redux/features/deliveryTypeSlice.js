import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"

const API_URL = "http://localhost:8080/api/delivery-types"

// Obtener tipos de envío
export const fetchDeliveryTypes = createAsyncThunk(
  "deliveryTypes/fetchDeliveryTypes",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_URL}`)
      return data
    } catch (error) {
      // Provide more info when server returns 500
      const serverMsg = error.response?.data || error.response?.statusText
      console.error("[deliveryTypeSlice] fetchDeliveryTypes error:", serverMsg, error)
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// Crear tipo de envío
export const createDeliveryType = createAsyncThunk(
  "deliveryTypes/createDeliveryType",
  async (formData, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token
      if (!token) return rejectWithValue("Usuario no autenticado. Iniciar sesión")

      const response = await axios.request({
        method: "post",
        url: `${API_URL}`,
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        data: formData,
      })

      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// Actualizar tipo de envío
export const updateDeliveryType = createAsyncThunk(
  "deliveryTypes/updateDeliveryType",
  async ({ id, formData }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token
      if (!token) return rejectWithValue("Usuario no autenticado. Iniciar sesión")

      const response = await axios.request({
        method: "put",
        url: `${API_URL}/${id}`,
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        data: formData,
      })

      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// Eliminar tipo de envío
export const deleteDeliveryType = createAsyncThunk(
  "deliveryTypes/deleteDeliveryType",
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token
      if (!token) return rejectWithValue("Usuario no autenticado. Iniciar sesión")

      await axios.request({
        method: "delete",
        url: `${API_URL}/${id}`,
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      return id
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// ===================== SLICE =====================

const deliveryTypeSlice = createSlice({
  name: "deliveryTypes",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeliveryTypes.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDeliveryTypes.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload
      })
      .addCase(fetchDeliveryTypes.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(deleteDeliveryType.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteDeliveryType.fulfilled, (state, action) => {
        state.loading = false
        state.list = state.list.filter((t) => t.id !== action.payload)
      })
      .addCase(deleteDeliveryType.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(createDeliveryType.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createDeliveryType.fulfilled, (state, action) => {
        state.loading = false
        state.list = [...state.list, action.payload]
      })
      .addCase(createDeliveryType.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(updateDeliveryType.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateDeliveryType.fulfilled, (state, action) => {
        state.loading = false
        state.list = state.list.map((dt) =>
          dt.id === action.payload.id ? action.payload : dt
        )
      })
      .addCase(updateDeliveryType.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export default deliveryTypeSlice.reducer
