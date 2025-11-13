import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

const API_URL = "http://localhost:8080/api/discounts"

// Obtener descuentos
export const fetchDiscounts = createAsyncThunk("discounts/fetchDiscounts", async () => {
  const response = await fetch(API_URL)
  const data = await response.json()
  return data
})

// Crear descuento
export const createDiscount = createAsyncThunk("discounts/createDiscount", async (formData) => {
  const token = localStorage.getItem("token")

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      amount: Number.parseInt(formData.amount),
      discountType: formData.discountType,
    }),
  })

  if (!response.ok) {
    throw new Error("Error al crear descuento")
  }

  return await response.json()
})

// Actualizar descuento
export const updateDiscount = createAsyncThunk("discounts/updateDiscount", async ({ id, formData }) => {
  const token = localStorage.getItem("token")

  const response = await fetch(`${API_URL}/update/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      amount: Number.parseInt(formData.amount),
      discountType: formData.discountType,
    }),
  })

  if (!response.ok) {
    throw new Error("Error al actualizar descuento")
  }

  return await response.json()
})

// Eliminar descuento
export const deleteDiscount = createAsyncThunk("discounts/deleteDiscount", async (id) => {
  const token = localStorage.getItem("token")

  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error("Error al eliminar descuento")
  }

  return id
})

// Asignar descuento a productos
export const assignDiscountToProducts = createAsyncThunk(
  "discounts/assignToProducts",
  async ({ discountId, productIds }) => {
    const token = localStorage.getItem("token")

    const response = await fetch(`${API_URL}/${discountId}/products`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(productIds),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText)
    }

    return await response.text()
  },
)

// Asignar descuento a categorias
export const assignDiscountToCategories = createAsyncThunk(
  "discounts/assignToCategories",
  async ({ discountId, categoryIds }) => {
    const token = localStorage.getItem("token")

    for (const categoryId of categoryIds) {
      const response = await fetch(`${API_URL}/${discountId}/category/${categoryId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Error al asignar a categoría ${categoryId}`)
      }
    }

    return categoryIds
  },
)

const discountSlice = createSlice({
  name: "discounts",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
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
        state.error = action.error.message
      })
      .addCase(deleteDiscount.fulfilled, (state, action) => {
        state.list = state.list.filter((d) => d.id !== action.payload)
      })
  },
})

export default discountSlice.reducer
