import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

const API_URL = "http://localhost:8080/api/payment_methods"

// Obtener métodos de pago
export const fetchPaymentMethods = createAsyncThunk("paymentMethods/fetchPaymentMethods", async () => {
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

// Crear método de pago
export const createPaymentMethod = createAsyncThunk("paymentMethods/createPaymentMethod", async (formData) => {
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
    throw new Error("Error al crear método de pago")
  }

  return await response.json()
})

// Actualizar método de pago
export const updatePaymentMethod = createAsyncThunk("paymentMethods/updatePaymentMethod", async ({ id, formData }) => {
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
    throw new Error("Error al actualizar método de pago")
  }

  return await response.json()
})

// Eliminar método de pago
export const deletePaymentMethod = createAsyncThunk("paymentMethods/deletePaymentMethod", async (id) => {
  const token = localStorage.getItem("token")

  await fetch(`${API_URL}/delete/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return id
})

const paymentMethodSlice = createSlice({
  name: "paymentMethods",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
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
        state.error = action.error.message
      })
      .addCase(deletePaymentMethod.fulfilled, (state, action) => {
        state.list = state.list.filter((m) => m.id !== action.payload)
      })
  },
})

export default paymentMethodSlice.reducer
