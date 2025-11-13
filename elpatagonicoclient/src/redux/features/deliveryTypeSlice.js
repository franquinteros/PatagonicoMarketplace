import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

const API_URL = "http://localhost:8080/api/deliveryType"

// Obtener tipos de envío
export const fetchDeliveryTypes = createAsyncThunk("deliveryTypes/fetchDeliveryTypes", async () => {
  const token = localStorage.getItem("token")

  const response = await fetch(API_URL, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`)
  }

  return await response.json()
})

// Crear tipo de envío
export const createDeliveryType = createAsyncThunk("deliveryTypes/createDeliveryType", async (formData) => {
  const token = localStorage.getItem("token")

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(formData),
  })

  if (!response.ok) {
    throw new Error("Error al crear tipo de envío")
  }

  return await response.json()
})

// Actualizar tipo de envío
export const updateDeliveryType = createAsyncThunk("deliveryTypes/updateDeliveryType", async ({ id, formData }) => {
  const token = localStorage.getItem("token")

  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(formData),
  })

  if (!response.ok) {
    throw new Error("Error al actualizar tipo de envío")
  }

  return await response.json()
})

// Eliminar tipo de envío
export const deleteDeliveryType = createAsyncThunk("deliveryTypes/deleteDeliveryType", async (id) => {
  const token = localStorage.getItem("token")

  await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return id
})

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
        state.error = action.error.message
      })
      .addCase(deleteDeliveryType.fulfilled, (state, action) => {
        state.list = state.list.filter((t) => t.id !== action.payload)
      })
  },
})

export default deliveryTypeSlice.reducer
